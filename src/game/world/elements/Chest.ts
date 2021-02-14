import { Entity } from "../../../engine/Entity"
import { Point } from "../../../engine/point"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { TileSetAnimation } from "../../../engine/tiles/TileSetAnimation"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_DIMENSIONS, TILE_SIZE } from "../../graphics/Tilesets"
import { Inventory } from "../../items/Inventory"
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
        const inventory = Inventory.load(data[INVENTORY] || [])

        const tiles = Tilesets.instance.dungeonCharacters.getTileSetAnimationFrames("chest_empty_open_anim")
        const openSpeed = 100
        const closeSpeed = 50
        const animations: AnimatedTileComponent = new AnimatedTileComponent([
            // opening
            new TileSetAnimation(
                [[tiles[0], openSpeed], [tiles[1], openSpeed], [tiles[2], openSpeed]], 
                () => animations.pause()
            ),
            // closing
            new TileSetAnimation(
                [[tiles[2], closeSpeed], [tiles[1], closeSpeed], [tiles[0], closeSpeed]], 
                () => animations.pause()
            ),
        ], TileTransform.new({ position: pos.times(TILE_SIZE), depth: pos.y * TILE_SIZE + TILE_SIZE }))

        animations.pause()
        
        const interactable = new Interactable(
            pos.times(TILE_SIZE).plusX(TILE_SIZE/2).plusY(TILE_SIZE/2),
            () => {
                console.log("open chest!")
                animations.goToAnimation(0).play()
            },
            new Point(0, -16)
        )

        const e = new Entity([animations, interactable])
        
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