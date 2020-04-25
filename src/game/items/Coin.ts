import { Component } from "../../engine/component"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Point } from "../../engine/point"
import { Tilesets } from "../graphics/Tilesets"
import { Collider } from "../../engine/collision/Collider"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"

// TODO: Some kind of "item" base class for dropped items
export class Coin extends Component {

    private animation: AnimatedTileComponent

    /**
     * @param position The bottom center where the item should be placed
     */
    constructor(position: Point) {
        super()
        this.start = (startData) => {
            const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)
            this.animation = this.entity.addComponent(new AnimatedTileComponent([anim]))
            const pos = position.minus(new Point(
                this.animation.transform.dimensions.x/2,
                this.animation.transform.dimensions.y
            ))
            this.animation.transform.position = pos
            this.animation.transform.depth = pos.y

            this.entity.addComponent(
                new BoxCollider(pos, this.animation.transform.dimensions, true).onColliderEnter(c => this.collide(c))
            )
        }
    }

    private collide(c: Collider) {
        const player = c.entity.getComponent(Player)
        if (!!player) {
            const d = player.entity.getComponent(Dude)
            if (d.isAlive) {
                player.entity.getComponent(Dude).inventory.coins++
                LocationManager.instance.currentLocation.dynamic.delete(this.entity)
                this.entity.selfDestruct()
            }
        }
    }
}