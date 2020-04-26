import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { rectContains } from "../../engine/util/utils"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Inventory } from "../items/Inventory"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { Entity } from "../../engine/Entity"
import { InputKey } from "../../engine/input"
import { UIStateManager } from "./UIStateManager"

export class InventoryDisplay extends Component {

    private static COLUMNS = 10

    private readonly e: Entity = new Entity()
    private trackedTileIndex: number
    private trackedTile: TileComponent  // non-null when being dragged
    private lastMousPos: Point  
    private tiles: TileComponent[]
    private bgTiles: TileComponent[]
    private showingInv = false
    get isOpen() { return this.showingInv }
    private offset: Point

    constructor() {
        super()
        this.e.addComponent(this)
    }

    inventory() {
        return Player.instance.entity.getComponent(Dude).inventory
    }

    update(updateData: UpdateData) {
        const inv = this.inventory().inventory

        if (updateData.input.isKeyDown(InputKey.I)) {
            if (this.isOpen) {
                this.hide()
            } else if (!UIStateManager.instance.isMenuOpen) {
                this.show(updateData.dimensions)
            }
        }

        if (!this.isOpen) {
            return
        }

        if (!!this.trackedTile) {
            if (updateData.input.isMouseUp) {  // drop n swap
                const newIndex = this.getInventoryIndexForPosition(updateData.input.mousePos)
                if (newIndex !== -1) {
                    const value = inv[this.trackedTileIndex]
                    const currentlyOccupiedSpot = inv[newIndex]
                    inv[newIndex] = value
                    inv[this.trackedTileIndex] = currentlyOccupiedSpot
                }
                this.trackedTile = null
                // refresh view
                this.hide()
                this.show(updateData.dimensions)
            } else {  // track
                this.trackedTile.transform.position = this.trackedTile.transform.position.plus(updateData.input.mousePos.minus(this.lastMousPos))
            }
        }

        this.lastMousPos = updateData.input.mousePos

        if (updateData.input.isMouseDown) {
            inv.forEach((stack, index) => {
                if (rectContains(this.getPositionForInventoryIndex(index), new Point(TILE_SIZE, TILE_SIZE), updateData.input.mousePos)) {
                    this.trackedTile = this.tiles[index]
                    this.trackedTileIndex = index
                }
            })
        }
    }

    private spawnBG() {
        const dimensions = new Point(
            1 + InventoryDisplay.COLUMNS, 
            1 + this.inventory().inventory.length/InventoryDisplay.COLUMNS
        )
        const ui = Tilesets.instance.oneBit
        this.bgTiles = []
        this.bgTiles.push(ui.getTileSource("invBoxNW").toComponent(new TileTransform(new Point(0, 0))))
        this.bgTiles.push(ui.getTileSource("invBoxNE").toComponent(new TileTransform(new Point(dimensions.x - 1, 0))))
        this.bgTiles.push(ui.getTileSource("invBoxSE").toComponent(new TileTransform(new Point(dimensions.x - 1, dimensions.y - 1))))
        this.bgTiles.push(ui.getTileSource("invBoxSW").toComponent(new TileTransform(new Point(0, dimensions.y - 1))))
        // horizontal lines
        for (let i = 1; i < dimensions.x - 1; i++) {
            this.bgTiles.push(ui.getTileSource("invBoxN").toComponent(new TileTransform(new Point(i, 0))))
            this.bgTiles.push(ui.getTileSource("invBoxS").toComponent(new TileTransform(new Point(i, dimensions.y - 1))))
        }
        // vertical lines
        for (let j = 1; j < dimensions.y - 1; j++) {
            this.bgTiles.push(ui.getTileSource("invBoxE").toComponent(new TileTransform(new Point(dimensions.x - 1, j))))
            this.bgTiles.push(ui.getTileSource("invBoxW").toComponent(new TileTransform(new Point(0, j))))
        }
        
        const uiOffset = new Point(TILE_SIZE/2, TILE_SIZE/2)
        this.bgTiles.forEach(c => {
            c.transform.position = c.transform.position.times(TILE_SIZE).plus(this.offset).minus(uiOffset)
            this.e.addComponent(c)
        })

        this.bgTiles.push(this.e.addComponent(ui.getTileSource("invBoxCenter").toComponent(
            new TileTransform(
                uiOffset.plus(this.offset), 
                new Point(InventoryDisplay.COLUMNS-1, this.inventory().inventory.length/InventoryDisplay.COLUMNS-1).times(TILE_SIZE)
            )
        )))
    }

    getEntity() {
        return this.e
    }

    hide() {
        if (!!this.trackedTile) {
            return 
        }
        this.showingInv = false
        this.tiles.forEach((c, index) => {
            if (!!c) {
                c.delete()
                this.tiles[index] = null
            }
        })
        this.bgTiles.forEach(c => {
            c.delete()
        })
        this.bgTiles = []
    }

    show(screenDimensions: Point) {
        this.showingInv = true

        const displayDimensions = new Point(
            InventoryDisplay.COLUMNS, 
            this.inventory().inventory.length/InventoryDisplay.COLUMNS
        ).times(TILE_SIZE)

        this.offset = new Point(
            Math.floor(screenDimensions.x/2 - displayDimensions.x/2),
            Math.floor(screenDimensions.y/6)
        )

        this.spawnBG()

        this.tiles = this.inventory().inventory.map((stack, index) => {
            if (!!stack) {
                const c = stack.item.inventoryIconSupplier().toComponent()
                return this.e.addComponent(c)
            }
        })

        this.tiles?.forEach((tile, index) => {
            if (!!tile) {
                tile.transform.position = this.getPositionForInventoryIndex(index)
            }
        })
    }

    private getPositionForInventoryIndex(i: number) {
        return new Point(i % InventoryDisplay.COLUMNS, Math.floor(i/InventoryDisplay.COLUMNS)).times(TILE_SIZE).plus(this.offset)
    }

    private getInventoryIndexForPosition(pos: Point) {
        const p = pos.minus(this.offset)
        const x = Math.floor(p.x/TILE_SIZE)
        const y = Math.floor(p.y/TILE_SIZE)
        if (x < 0 || x >= InventoryDisplay.COLUMNS || y < 0 || y >= Math.floor(this.inventory().inventory.length/InventoryDisplay.COLUMNS)) {
            return -1
        }
        return y * InventoryDisplay.COLUMNS + x
    }
}