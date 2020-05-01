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

enum State {
    NOT_BLOCKING,
    BLOCKING
}

/**
 * A weapon being wielded by a dude
 */
export class Shield extends Component {

    private blockingShieldSprite: TileComponent
    private readonly baseOffset = new Point(3, 12)
    private state: State = State.NOT_BLOCKING
    // private slashSprite: TileComponent  // TODO try adding particles when someone hits a blocking shield
    private dude: Dude

    constructor(shieldId: string) {
        super()
        this.start = (startData) => {
            this.dude = this.entity.getComponent(Dude)
            this.blockingShieldSprite = this.entity.addComponent(
                new TileComponent(
                    Tilesets.instance.dungeonCharacters.getTileSource("shield0"),
                    new TileTransform().relativeTo(this.dude.animation.transform)
                )
            )
            this.blockingShieldSprite.transform.depth = -.5
        }
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }

    animate() {
        let pos = this.baseOffset
        // const offsetFromEdge = new Point(6, 26).minus(this.weaponSprite.transform.dimensions)  // for DRAWN/SHEATHED

        // // relative position for DRAWN state when characer is facing right (mirroring logic below)
        // let pos = new Point(0, 0)
        // let rotation = 0

        // if (this.state === State.DRAWN) {
        //     pos = offsetFromEdge
        // } else if (this.state === State.SHEATHED) {  // TODO add side sheath for swords
        //     // center on back
        //     pos = offsetFromEdge.plus(new Point(3, -1))
        // } else if (this.state === State.ATTACKING) {
        //     const posWithRotation = this.getAttackAnimationPosition()
        //     pos = posWithRotation[0].plus(offsetFromEdge)
        //     rotation = posWithRotation[1]
        // }

        // this.weaponSprite.transform.rotation = rotation
        // this.weaponSprite.transform.mirrorY = this.state == State.SHEATHED

        
        pos = pos.plus(this.dude.getAnimationOffsetPosition())

        this.blockingShieldSprite.transform.position = pos

        // this.weaponSprite.transform.position = pos

        // // show sword behind character if sheathed
        // this.weaponSprite.transform.depth = this.state == State.SHEATHED ? -1 : 1
    }

    isDrawn() {
        // return this.state !== State.SHEATHED
    }

    toggleSheathed() {
        // if (this.state === State.SHEATHED) {
        //     this.state = State.DRAWN
        // } else if (this.state === State.DRAWN) {
        //     this.state = State.SHEATHED
        // }
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