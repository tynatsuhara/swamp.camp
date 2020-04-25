import { Component } from "../../../engine/component"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/point"
import { Interactable } from "./Interactable"
import { BoxCollider } from "../../../engine/collision/BoxCollider"

export class Campfire extends Component {

    private campfireOff: TileComponent
    private campfireOn: AnimatedTileComponent

    /**
     * @param pos relative tile point
     */
    constructor(pos: Point) {
        super()
        this.start = () => {
            pos = pos.times(TILE_SIZE)

            this.campfireOff = this.entity.addComponent(new TileComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), 
                new TileTransform(pos)
            ))
            this.campfireOff.enabled = false
            this.campfireOff.transform.depth = pos.y + TILE_SIZE

            this.campfireOn = this.entity.addComponent(new AnimatedTileComponent(
                [Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)],
                new TileTransform(pos)
            ))
            this.campfireOn.enabled = true
            this.campfireOn.transform.depth = pos.y + TILE_SIZE

            const offset = new Point(0, 5)
            this.entity.addComponent(new BoxCollider(
                pos.plus(offset), 
                new Point(TILE_SIZE, TILE_SIZE).minus(offset)
            ))

            // Toggle between on/off when interacted with
            this.entity.addComponent(new Interactable(pos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2)), () => {
                this.campfireOff.enabled = this.campfireOn.enabled
                this.campfireOn.enabled = !this.campfireOn.enabled
            }))
        }
    }
}