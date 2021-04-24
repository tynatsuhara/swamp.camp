import { Component } from "../../../engine/component"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { Tilesets } from "../../graphics/Tilesets"
import { UpdateData } from "../../../engine/engine"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/point"
import { Dude } from "../Dude"
import { Animator } from "../../../engine/util/Animator"
import { ShieldType } from "./ShieldType"

enum State {
    ON_BACK,
    DRAWN,
}

/**
 * A shield being wielded by a dude
 */
export class Shield extends Component {

    dude: Dude
    sprite: TileComponent

    private state: State = State.DRAWN
    // private slashSprite: TileComponent  // TODO try adding particles when someone hits a blocking shield
    private blockingActive = false
    private raisedPerc = 0 // for animation
    private timeToRaiseMs = 120
    readonly type: ShieldType

    constructor(type: ShieldType, spriteId: string) {
        super()
        this.type = type
        this.start = (startData) => {
            this.dude = this.entity.getComponent(Dude)
            this.sprite = this.entity.addComponent(
                new TileComponent(
                    Tilesets.instance.dungeonCharacters.getTileSource(spriteId),
                    new TileTransform().relativeTo(this.dude.animation.transform)
                )
            )
        }
    }

    update(updateData: UpdateData) {
        // default (drawn) position
        let pos = this.dude.animation.transform.dimensions.minus(new Point(12, 16))

        if (this.state === State.ON_BACK) {
            pos = pos.plus(new Point(-6, -1))
        } else if (this.state === State.DRAWN) {
            pos = pos.plus(new Point(5, 4).times(this.raisedPerc < .7 ? this.raisedPerc : 1.4-this.raisedPerc).apply(Math.floor))

            if (this.blockingActive) {  // raising
                this.raisedPerc = Math.min(this.raisedPerc + updateData.elapsedTimeMillis/this.timeToRaiseMs, 1)
            } else {  // lowering
                this.raisedPerc = Math.max(this.raisedPerc - updateData.elapsedTimeMillis/this.timeToRaiseMs, 0)
            }
        }

        pos = pos.plus(this.dude.getAnimationOffsetPosition())

        this.sprite.transform.position = pos
        this.sprite.transform.depth = this.raisedPerc > .7 ? .75 : -.75
    }

    toggleOnBack() {
        if (this.state === State.DRAWN) {
            this.state = State.ON_BACK
        } else {
            this.state = State.DRAWN
        }
    }

    block(blockingActive: boolean) {
        if (this.state === State.ON_BACK || !this.dude) {
            return
        }
        if (blockingActive && this.dude.weapon?.isAttacking()) {  // you can't start blocking when you're attacking
            return
        }
        this.blockingActive = blockingActive
    }

    isBlocking() {
        return this.state === State.DRAWN && this.raisedPerc > .3
    }

    canAttack() {
        return this.state === State.DRAWN && this.raisedPerc < 1
    }
}