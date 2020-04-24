import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Point } from "../../engine/point"
import { TileManager } from "../graphics/TileManager"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Collider } from "../../engine/collision/Collider"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "../characters/Player"
import { EntityManager } from "../EntityManager"
import { Dude } from "../characters/Dude"

// TODO: Some kind of "item" base class for dropped items
export class Coin extends Component {

    private animation: AnimatedTileComponent
    private collider: Collider

    /**
     * @param position The bottom center where the item should be placed
     */
    constructor(position: Point) {
        super()
        this.start = (startData) => {
            const anim = TileManager.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)
            this.animation = this.entity.addComponent(new AnimatedTileComponent([anim]))
            const pos = position.minus(new Point(
                this.animation.transform.dimensions.x/2,
                this.animation.transform.dimensions.y
            ))
            this.animation.transform.position = pos
            this.animation.transform.depth = pos.y

            this.collider = this.entity.addComponent(
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
                EntityManager.instance.delete(this.entity)
            }
        }
    }
}