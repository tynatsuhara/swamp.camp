import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { InputKey } from "../../engine/input"
import { Point } from "../../engine/point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { NineSlice } from "../../engine/tiles/NineSlice"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { rectContains } from "../../engine/util/utils"
import { Player } from "../characters/Player"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../graphics/Tilesets"
import { Inventory } from "../items/Inventory"
import { ITEM_METADATA_MAP } from "../items/Items"
import { saveManager } from "../SaveManager"
import { LocationManager } from "../world/LocationManager"
import { Color } from "./Color"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { TEXT_FONT, TEXT_SIZE } from "./Text"
import { Tooltip } from "./Tooltip"
import { UIStateManager } from "./UIStateManager"

export class InventoryDisplay extends Component {

    static instance: InventoryDisplay

    private static COLUMNS = 10

    private readonly e: Entity = new Entity()  // entity for this component
    private displayEntity: Entity
    private trackedTileInventory: Inventory
    private trackedTileIndex: number
    private trackedTile: TileComponent  // non-null when being dragged
    private lastMousPos: Point  
    private tiles: TileComponent[]
    private bgTiles: TileComponent[]
    private showingInv = false
    get isOpen() { return this.showingInv }
    private offset: Point
    private tooltip: Tooltip
    private readonly coinsOffset = new Point(0, -18)
    private onClose: () => void

    constructor() {
        super()
        this.e.addComponent(this)
        this.tooltip = this.e.addComponent(new Tooltip())
        InventoryDisplay.instance = this
    }

    inventory() {
        return Player.instance.dude.inventory
    }

    lateUpdate(updateData: UpdateData) {
        // const inv = this.inventory().inventory

        const pressI = updateData.input.isKeyDown(Controls.inventoryButton)
        const pressEsc = updateData.input.isKeyDown(InputKey.ESC)

        if (this.isOpen && (pressI || pressEsc)) {
            this.close()
        } else if (pressI && !UIStateManager.instance.isMenuOpen) {
            this.show()
        }

        if (!this.isOpen) {
            return
        }

        const hoverResult = this.getInventoryIndexPosition(updateData.input.mousePos)
        const hoverInv = hoverResult[0]
        const hoverIndex = hoverResult[1]

        if (!!this.trackedTile) {  // dragging
            this.tooltip.clear()
            if (updateData.input.isMouseUp) {  // drop n swap
                if (hoverIndex !== -1) {
                    const value = hoverInv.inventory[this.trackedTileIndex]
                    const currentlyOccupiedSpot = hoverInv.inventory[hoverIndex]
                    hoverInv.inventory[hoverIndex] = value
                    this.trackedTileInventory.inventory[this.trackedTileIndex] = currentlyOccupiedSpot
                }
                this.trackedTileInventory = null
                this.trackedTile = null
                // refresh view
                this.show(this.onClose)
            } else {  // track
                this.trackedTile.transform.position = this.trackedTile.transform.position.plus(updateData.input.mousePos.minus(this.lastMousPos))
            }
        } else if (hoverIndex !== -1 && !!hoverInv.inventory[hoverIndex]) {  // we're hovering over an item
            this.tooltip.position = updateData.input.mousePos
            const stack = hoverInv.inventory[hoverIndex]
            const item = ITEM_METADATA_MAP[stack.item]
            const count = stack.count > 1 ? ' x' + stack.count : ''

            const actions: { verb: string, actionFn: () => void }[] = []

            const decrementStack = () => {
                if (stack.count === 1) {
                    hoverInv.inventory[hoverIndex] = null
                } else {
                    stack.count--
                }
            }

            if (item.element !== null && LocationManager.instance.currentLocation.allowPlacing) {
                actions.push({
                    verb: 'place',
                    actionFn: () => {
                        this.close()
                        PlaceElementDisplay.instance.startPlacing(
                            item.element, 
                            decrementStack
                        )
                    }
                })
            }
            if (!!item.equippable && Player.instance.dude.weaponType !== item.equippable) {
                actions.push({
                    verb: 'equip',
                    actionFn: () => {
                        this.close()
                        Player.instance.dude.setWeapon(item.equippable)
                    }
                })
            }
            if (!!item.consumable) {
                actions.push({
                    verb: 'eat',
                    actionFn: () => {
                        item.consumable()
                        decrementStack()
                    }
                })
            }

            // We currently only support up to 2 interaction types per item
            const interactButtonOrder = [Controls.interactButton, Controls.interactButtonSecondary]

            let tooltipString = `${item.displayName}${count}` 

            actions.forEach((action, i) => {
                tooltipString += `\n[${Controls.keyString(interactButtonOrder[i])} to ${action.verb}]`
            })

            this.tooltip.say(tooltipString)

            actions.forEach((action, i) => {
                if (updateData.input.isKeyDown(interactButtonOrder[i])) {
                    action.actionFn()
                }
            })
        } else {
            this.tooltip.clear()
        }

        this.lastMousPos = updateData.input.mousePos

        if (updateData.input.isMouseDown && !!hoverInv) {
            hoverInv.inventory.forEach((stack, index) => {
                const isClickingTile = rectContains(
                    this.getPositionForInventoryIndex(index, this.offset), 
                    TILE_DIMENSIONS, 
                    updateData.input.mousePos
                )
                if (isClickingTile) {
                    this.trackedTileInventory = hoverInv
                    this.trackedTile = this.tiles[index]
                    this.trackedTileIndex = index
                }
            })
        }
    }

    private spawnBG() {
        this.bgTiles = NineSlice.makeNineSliceComponents(
            Tilesets.instance.oneBit.getNineSlice("invBoxNW"), 
            this.offset.minus(new Point(TILE_SIZE/2, TILE_SIZE/2)),
            new Point(
                1 + InventoryDisplay.COLUMNS, 
                1 + this.inventory().inventory.length/InventoryDisplay.COLUMNS
            )
        )

        this.bgTiles.forEach(tile => {
            this.displayEntity.addComponent(tile)
        })

        this.bgTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH
    }

    getEntities(): Entity[] {
        return [this.e, this.displayEntity]
    }

    close() {
        if (!!this.trackedTile) {
            return 
        }
        this.showingInv = false
        this.tiles.forEach((c, index) => {
            this.tiles[index] = null
        })
        this.bgTiles.forEach(c => {
            c.delete()
        })
        this.bgTiles = []
        this.tooltip.clear()
        this.displayEntity = null

        if (this.onClose) {
            this.onClose()
            this.onClose = null
        }
    }

    show(onClose: () => void = null) {
        this.onClose = onClose
        const screenDimensions = Camera.instance.dimensions
        this.showingInv = true

        const displayDimensions = new Point(
            InventoryDisplay.COLUMNS, 
            this.inventory().inventory.length/InventoryDisplay.COLUMNS
        ).times(TILE_SIZE)

        this.offset = new Point(
            Math.floor(screenDimensions.x/2 - displayDimensions.x/2),
            Math.floor(screenDimensions.y/5)
        )

        this.displayEntity = new Entity()

        // coins
        this.displayEntity.addComponent(new AnimatedTileComponent(
            [Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)],
            new TileTransform(this.offset.plus(this.coinsOffset))
        ))
        this.displayEntity.addComponent(
            new BasicRenderComponent(
                new TextRender(
                    `x${saveManager.getState().coins}`, 
                    new Point(9, 1).plus(this.offset).plus(this.coinsOffset), 
                    TEXT_SIZE, 
                    TEXT_FONT, 
                    Color.YELLOW,
                    UIStateManager.UI_SPRITE_DEPTH
                )
            )
        )

        // background
        this.spawnBG()

        // icons
        this.tiles = this.inventory().inventory.map((stack, index) => {
            if (!!stack) {
                const c = ITEM_METADATA_MAP[stack.item].inventoryIconSupplier().toComponent()
                c.transform.depth = UIStateManager.UI_SPRITE_DEPTH + 1
                return this.displayEntity.addComponent(c)
            }
        })

        this.tiles?.forEach((tile, index) => {
            if (!!tile) {
                tile.transform.position = this.getPositionForInventoryIndex(index, this.offset)
            }
        })
    }

    private getPositionForInventoryIndex(i: number, inventoryOffset: Point) {
        return new Point(i % InventoryDisplay.COLUMNS, Math.floor(i/InventoryDisplay.COLUMNS)).times(TILE_SIZE).plus(inventoryOffset)
    }

    private getInventoryIndexPosition(pos: Point): [Inventory, number] {
        const getIndexForOffset = (offset) => {
            const p = pos.minus(offset)
            const x = Math.floor(p.x/TILE_SIZE)
            const y = Math.floor(p.y/TILE_SIZE)
            if (x < 0 || x >= InventoryDisplay.COLUMNS || y < 0 || y >= Math.floor(this.inventory().inventory.length/InventoryDisplay.COLUMNS)) {
                return -1
            }
            return y * InventoryDisplay.COLUMNS + x
        }

        const index = getIndexForOffset(this.offset)
        if (index > -1) {
            return [this.inventory(), index]
        }

        return [null, -1]
    }
}