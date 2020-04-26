import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { rectContains } from "../../engine/util/utils"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Inventory } from "../items/Inventory"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { InputKey } from "../../engine/input"
import { View } from "../../engine/View"

export class InventoryDisplay extends Component {

    private static COLUMNS = 10

    private inventory: Inventory
    private trackedTile: TileComponent  // non-null when being dragged
    private lastMousPos: Point  
    private tiles: TileComponent[]
    private showingInv = false
    private offset: Point

    update(updateData: UpdateData) {
        if (updateData.input.isKeyDown(InputKey.I)) {
            if (this.showingInv) {
                this.hide()
            } else {
                this.show()
            }
        }

        if (!this.showingInv) {
            return
        }

        this.updatePos(updateData)

        if (!!this.trackedTile) {
            if (updateData.input.isMouseUp) {
                // TODO drop
                this.trackedTile = null
            } else {  // track
                this.trackedTile.transform.position = this.trackedTile.transform.position.plus(updateData.input.mousePos.minus(this.lastMousPos))
            }
        }

        if (updateData.input.isMouseDown) {
            this.inventory.inventory.forEach((stack, index) => {
                if (rectContains(this.getPositionForInventoryIndex(index), new Point(TILE_SIZE, TILE_SIZE), updateData.input.mousePos)) {
                    this.lastMousPos = updateData.input.mousePos
                    this.trackedTile = this.tiles[index]
                }
            })
        }
    }

    private hide() {
        if (!!this.trackedTile) {
            return 
        }
        this.showingInv = false
        this.tiles.forEach((c, index) => {
            if (!!c) {
                this.entity.removeComponent(c)
                this.tiles[index] = null
            }
        })
    }

    private show() {
        this.showingInv = true
        this.inventory = Player.instance.entity.getComponent(Dude).inventory
        this.tiles = this.inventory.inventory.map((stack, index) => {
            if (!!stack) {
                const c = stack.item.inventoryIconSupplier().toComponent()
                return this.entity.addComponent(c)
            }
        })
    }

    private updatePos(updateData: UpdateData) {
        const displayDimensions = new Point(
            InventoryDisplay.COLUMNS, 
            this.inventory.inventory.length/InventoryDisplay.COLUMNS
        ).times(TILE_SIZE)

        this.offset = new Point(
            updateData.dimensions.x/2 - displayDimensions.x/2,
            updateData.dimensions.y/6
        )

        this.tiles?.forEach((tile, index) => {
            if (!!tile) {
                tile.transform.position = this.getPositionForInventoryIndex(index)
            }
        })
    }

    private getPositionForInventoryIndex(i: number) {
        return new Point(i % InventoryDisplay.COLUMNS, Math.floor(i/InventoryDisplay.COLUMNS)).times(TILE_SIZE).plus(this.offset)
    }

    // private getInventoryIndexForPosition(pos: Point) {
    //     return i * 
    //     return new Point(i % 10, Math.floor(i/10))
    // }
}