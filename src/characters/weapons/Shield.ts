import { Point, UpdateData } from "brigsby/dist"
import { ImageFilter, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"
import { Simulatable } from "../../world/Simulatable"
import { Dude } from "../Dude"
import { ShieldType } from "./ShieldType"

enum State {
    ON_BACK,
    DRAWN,
}

/**
 * A shield being wielded by a dude
 */
export class Shield extends Simulatable {
    dude: Dude
    sprite: StaticSpriteSource
    transform: SpriteTransform

    private offsetFromCenter: Point
    private state: State = State.DRAWN
    // private slashSprite: TileComponent  // TODO try adding particles when someone hits a blocking shield
    private blockingActive = false
    private raisedPerc = 0 // for animation
    private timeToRaiseMs = 120

    constructor(readonly type: ShieldType, spriteId: string, offsetFromCenter = Point.ZERO) {
        super()
        this.offsetFromCenter = offsetFromCenter
        this.awake = () => {
            console.log("shield awake " + spriteId)
            this.dude = this.entity.getComponent(Dude)
            this.sprite = Tilesets.instance.dungeonCharacters.getTileSource(spriteId)
            this.transform = SpriteTransform.new({
                dimensions: this.sprite.dimensions,
            }).relativeTo(this.dude.animation.transform)
        }
    }

    getWrappedRenderMethods(filter: ImageFilter) {
        return [this.sprite.filtered(filter).toImageRender(this.transform)]
    }

    update(updateData: UpdateData) {
        // default (drawn) position
        // 16x28
        // -> 4, 12
        const dims = this.dude.animation.transform.dimensions
        let pos = new Point(dims.x / 2, dims.y).minus(new Point(4, 16))

        if (this.state === State.ON_BACK) {
            pos = pos.plus(new Point(-6, -1))
        } else if (this.state === State.DRAWN) {
            pos = pos
                .plus(
                    new Point(5, 4)
                        .times(this.raisedPerc < 0.7 ? this.raisedPerc : 1.4 - this.raisedPerc)
                        .apply(Math.floor)
                )
                .plus(this.offsetFromCenter)

            if (this.blockingActive) {
                // raising
                this.raisedPerc = Math.min(
                    this.raisedPerc + updateData.elapsedTimeMillis / this.timeToRaiseMs,
                    1
                )
            } else {
                // lowering
                this.raisedPerc = Math.max(
                    this.raisedPerc - updateData.elapsedTimeMillis / this.timeToRaiseMs,
                    0
                )
            }
        }

        pos = pos.plus(this.dude.getOffsetRelativeToAnimation())

        this.transform.position = pos
        this.transform.depth = this.raisedPerc > 0.7 ? 0.75 : -0.75
    }

    setOnBack(onBack: boolean) {
        this.state = onBack ? State.ON_BACK : State.DRAWN
        this.raisedPerc = 0
    }

    block(blockingActive: boolean) {
        if (this.state === State.ON_BACK || !this.dude) {
            return
        }
        if (blockingActive && this.dude.weapon?.isAttacking()) {
            // you can't start blocking when you're attacking
            return
        }
        this.blockingActive = blockingActive
    }

    isBlocking() {
        return this.state === State.DRAWN && this.raisedPerc > 0.3
    }

    canAttack() {
        return this.state === State.DRAWN && this.raisedPerc < 1
    }

    simulate(duration: number): void {}
}

export type ReadOnlyShield = Omit<Shield, "setOnBack" | "block">
