import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileManager } from "../graphics/TileManager"
import { StartData, UpdateData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Dude } from "./Dude"
import { Animator } from "../../engine/util/Animator"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING
}

export class Weapon extends Component {

    private readonly id: string
    private weaponSprite: TileComponent
    private state: State = State.DRAWN
    private slashSprite: TileComponent

    constructor(id: string) {
        super()
        this.id = id
    }

    start(startData: StartData) {
        this.weaponSprite = this.entity.addComponent(
            new TileComponent(
                TileManager.instance.dungeonCharacters.getTileSource(this.id)
            )
        )

        this.slashSprite = this.entity.addComponent(
            new TileComponent(
                TileManager.instance.oneBit.getTileSource("slash")
            )
        )
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }
    }

    syncWithPlayerAnimation(character: Dude, anim: AnimatedTileComponent) {
        if (!!this.weaponSprite) {
            // relative position for DRAWN state
            const offset = new Point(6, 26)
            let pos: Point = offset.minus(this.weaponSprite.transform.dimensions)
            let rotation = 0

            if (this.state == State.SHEATHED) {
                // center on back
                pos = new Point(anim.transform.dimensions.x/2 - this.weaponSprite.transform.dimensions.x/2, pos.y)
                        .plus(new Point(anim.transform.mirrorX ? 1 : -1, -1))
            } else if (this.state == State.ATTACKING) {
                const posWithRotation = this.getAttackAnimationPosition()
                pos = pos.plus(posWithRotation[0])
                rotation = posWithRotation[1]
            }

            this.weaponSprite.transform.rotation = rotation

            // magic based on the animations
            const f = anim.currentFrame()
            if (!character.isMoving) {
                pos = pos.plus(new Point(0, f == 3 ? 1 : f))
            } else {
                pos = pos.plus(new Point(0, f == 0 ? -1 : -((3 - anim.currentFrame()))))
            }

            this.weaponSprite.transform.position = anim.transform.position.plus(pos)

            // show sword behind character if mirrored
            this.weaponSprite.transform.depth = anim.transform.depth - (anim.transform.mirrorX || this.state == State.SHEATHED ? 1 : 0)
            this.weaponSprite.transform.mirrorX = anim.transform.mirrorX


            // TODO add attack animation
        }
    }

    toggleSheathed() {
        if (this.state === State.SHEATHED) {
            this.state = State.DRAWN
        } else if (this.state === State.DRAWN) {
            this.state = State.SHEATHED
        }
    }

    attack() {
        if (this.state === State.DRAWN) {
            this.playAttackAnimation()
        }
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    private currentAnimation: number = 0
    private playAttackAnimation() {
        this.state = State.ATTACKING
        this.animator = new Animator(
            Animator.frames(8, 40), 
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.state = State.DRAWN  // reset to DRAWN when animation finishes
                this.animator = null
            }
        ) 
    }

    /**
     * Returns (position, rotation)
     */
    private getAttackAnimationPosition(): [Point, number] {
        const swingStartFrame = 3
        const resettingFrame = 7

        if (this.currentAnimationFrame < swingStartFrame) {
            return [new Point(this.currentAnimationFrame * 3, 0), 0]
        } else if (this.currentAnimationFrame < resettingFrame) {
            return [
                new Point(
                    (8-this.currentAnimationFrame) + this.weaponSprite.transform.dimensions.y-this.weaponSprite.transform.dimensions.x, 
                    10  // TODO make this work with other weapon sizes
                ),
                90
            ]
        } else {
            console.log(-this.currentAnimationFrame+resettingFrame)
            return [new Point((1-this.currentAnimationFrame+resettingFrame) * 3, 2), 0]
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