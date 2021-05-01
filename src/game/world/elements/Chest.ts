import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { Entity } from "../../../engine/Entity"
import { Point } from "../../../engine/Point"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { TileSetAnimation } from "../../../engine/tiles/TileSetAnimation"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../../graphics/Tilesets"
import { Inventory } from "../../items/Inventory"
import { Item } from "../../items/Items"
import { InventoryDisplay } from "../../ui/InventoryDisplay"
import { UIStateManager } from "../../ui/UIStateManager"
import { WorldLocation } from "../WorldLocation"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

const INVENTORY = 'i'

export class ChestFactory extends ElementFactory {

    type = ElementType.CHEST
    dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const inventory = !!data[INVENTORY] ? Inventory.load(data[INVENTORY]) : new Inventory(20)

        const tiles = Tilesets.instance.dungeonCharacters.getTileSetAnimationFrames("chest_empty_open_anim")
        const openSpeed = 80
        const closeSpeed = 20
        const animator: AnimatedTileComponent = new AnimatedTileComponent([
            // opening
            new TileSetAnimation(
                [[tiles[0], openSpeed], [tiles[1], openSpeed], [tiles[2], openSpeed]], 
                () => animator.pause()
            ),
            // closing
            new TileSetAnimation(
                [[tiles[2], closeSpeed], [tiles[1], closeSpeed], [tiles[0], closeSpeed]], 
                () => animator.pause()
            ),
        ], TileTransform.new({ position: pos.times(TILE_SIZE), depth: pos.y * TILE_SIZE + TILE_SIZE }))

        animator.pause()
        
        const interactable = new Interactable(
            pos.times(TILE_SIZE).plusX(TILE_SIZE/2).plusY(10),
            () => {
                InventoryDisplay.instance.show(
                    () => animator.goToAnimation(1).play(),
                    inventory
                )
                animator.goToAnimation(0).play()
            },
            new Point(0, -17)
        )

        const collider = new BoxCollider(
            pos.times(TILE_SIZE).plusY(9),
            new Point(TILE_SIZE, 7)
        )

        const e = new Entity([animator, interactable, collider])
        
        return e.addComponent(new ElementComponent(
            this.type,
            pos,
            [pos],
            () => ({
                [INVENTORY]: inventory.save()
            })
        ))
    }
}