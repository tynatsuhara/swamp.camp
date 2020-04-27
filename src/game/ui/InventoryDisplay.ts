import { Component } from "../../engine/component"
import { UpdateData, StartData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { rectContains } from "../../engine/util/utils"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { Entity } from "../../engine/Entity"
import { InputKey } from "../../engine/input"
import { UIStateManager } from "./UIStateManager"
import { makeNineSliceTileComponents } from "../../engine/tiles/NineSlice"
import { TextBox } from "./TextBox"

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
    private tooltip: TextBox

    constructor() {
        super()
        this.e.addComponent(this)
        this.tooltip = this.e.addComponent(new TextBox("wood x2"))
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

        const newIndex = this.getInventoryIndexForPosition(updateData.input.mousePos)
        if (newIndex !== -1 && !!inv[newIndex]) {
            this.tooltip.position = updateData.input.mousePos
            const stack = inv[newIndex]
            this.tooltip.say(`${stack.item.displayName}${stack.count > 1 ? '  x' + stack.count : ''}`)
        } else {
            this.tooltip.clear()
        }
        
        if (!!this.trackedTile) {
            if (updateData.input.isMouseUp) {  // drop n swap
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
        this.bgTiles = makeNineSliceTileComponents(
            Tilesets.instance.oneBit.getNineSlice("invBoxNW"), 
            this.offset.minus(new Point(TILE_SIZE/2, TILE_SIZE/2)),
            new Point(
                1 + InventoryDisplay.COLUMNS, 
                1 + this.inventory().inventory.length/InventoryDisplay.COLUMNS
            )
        )

        this.bgTiles.forEach(tile => {
            this.e.addComponent(tile)
        })
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
        this.tooltip.clear()
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