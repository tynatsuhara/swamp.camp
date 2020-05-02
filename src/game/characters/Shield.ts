import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets } from "../graphics/Tilesets"
import { StartData, UpdateData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Dude } from "./Dude"
import { Animator } from "../../engine/util/Animator"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "./Player"
import { LocationManager } from "../world/LocationManager"
import { Weapon } from "./Weapon"

enum State {
    ON_BACK,
    DRAWN,
    BLOCKING
}

/**
 * A weapon being wielded by a dude
 */
export class Shield extends Component {

    private blockingShieldSprite: TileComponent
    private state: State = State.DRAWN
    // private slashSprite: TileComponent  // TODO try adding particles when someone hits a blocking shield
    private dude: Dude

    constructor(shieldId: string) {
        super()
        this.start = (startData) => {
            this.dude = this.entity.getComponent(Dude)
            this.blockingShieldSprite = this.entity.addComponent(
                new TileComponent(
                    Tilesets.instance.dungeonCharacters.getTileSource(shieldId),
                    new TileTransform().relativeTo(this.dude.animation.transform)
                )
            )
        }
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }

    animate() {
        // TODO: add shield animations

        let pos = this.dude.animation.transform.dimensions.minus(new Point(12, 16))

        if (this.state === State.ON_BACK) {
            pos = new Point(-3, 10)
        } else if (this.state === State.BLOCKING) {
            pos = pos.plus(new Point(3, 3))
        }

        pos = pos.plus(this.dude.getAnimationOffsetPosition())

        this.blockingShieldSprite.transform.position = pos

        this.blockingShieldSprite.transform.depth = this.state === State.BLOCKING ? .75 : -.75
    }

    // isDrawn() {
        // return this.state !== State.SHEATHED
    // }

    toggleOnBack() {
        if (this.state === State.DRAWN || this.state === State.BLOCKING) {
            this.state = State.ON_BACK
        } else {
            this.state = State.DRAWN
        }
    }

    block(blockingActive: boolean) {
        if (this.state === State.ON_BACK) {
            return
        }
        if (blockingActive && (!this.dude.weapon || !this.dude.weapon.isAttacking())) {
            this.state = State.BLOCKING
        } else {
            this.state = State.DRAWN
        }
    }

    isBlocking() {
        return this.state === State.BLOCKING
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    // private playAttackAnimation() {
    //     this.state = State.ATTACKING
    //     this.animator = new Animator(
    //         Animator.frames(8, 40), 
    //         (index) => this.currentAnimationFrame = index, 
    //         () => {
    //             this.state = State.DRAWN  // reset to DRAWN when animation finishes
    //             this.animator = null
    //         }
    //     ) 
    // }

    /**
     * Returns (position, rotation)
     */
    // private getAttackAnimationPosition(): [Point, number] {
    //     const swingStartFrame = 3
    //     const resettingFrame = 7

    //     if (this.currentAnimationFrame < swingStartFrame) {
    //         return [new Point(this.currentAnimationFrame * 3, 0), 0]
    //     } else if (this.currentAnimationFrame < resettingFrame) {
    //         return [
    //             new Point(
    //                 (6-this.currentAnimationFrame) + this.weaponSprite.transform.dimensions.y - swingStartFrame*3, 
    //                 Math.floor(this.weaponSprite.transform.dimensions.y/2 - 1)
    //             ),
    //             90
    //         ]
    //     } else {
    //         return [new Point((1-this.currentAnimationFrame+resettingFrame) * 3, 2), 0]
    //     }
    // }
}