import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileManager } from "../graphics/TileManager"
import { StartData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Dude } from "./Dude"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING
}

export class Weapon extends Component {

    private readonly id: string
    private swordAnim: TileComponent
    private state: State = State.DRAWN

    constructor(id: string) {
        super()
        this.id = id
    }

    start(startData: StartData) {
        this.swordAnim = this.entity.addComponent(
            new TileComponent(
                TileManager.instance.dungeonCharacters.getTileSource(this.id)
            )
        )
    }

    syncWithPlayerAnimation(character: Dude, anim: AnimatedTileComponent) {
        if (!!this.swordAnim) {
            // relative position for DRAWN state
            let pos: Point = new Point(6, 26).minus(this.swordAnim.transform.dimensions)

            if (this.state == State.SHEATHED) {
                // center on back
                pos = new Point(anim.transform.dimensions.x/2 - this.swordAnim.transform.dimensions.x/2, pos.y)
                        .plus(new Point(anim.transform.mirrorX ? 1 : -1, -1))
            } else if (this.state == State.ATTACKING) {
                // TODO
            }

            // magic based on the animations
            const f = anim.currentFrame()
            if (!character.isMoving) {
                pos = pos.plus(new Point(0, f == 3 ? 1 : f))
            } else {
                pos = pos.plus(new Point(0, f == 0 ? -1 : -((3 - anim.currentFrame()))))
            }

            this.swordAnim.transform.position = anim.transform.position.plus(pos)

            // show sword behind character if mirrored
            this.swordAnim.transform.depth = anim.transform.depth - (anim.transform.mirrorX || this.state == State.SHEATHED ? 1 : 0)
            this.swordAnim.transform.mirrorX = anim.transform.mirrorX


            // TODO add attack animation
        }
    }

    // set weaponSheathed(value: boolean) {
    //     this._weaponSheathed = value
    //     this.swordAnim.transform.mirrorY = value
    // }

    // get weaponSheathed() {
    //     // TODO make it so a weapon can be sheathed on your back
    //      return this._weaponSheathed
    // }
}