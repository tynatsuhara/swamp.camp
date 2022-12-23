import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Animator } from "brigsby/dist/util/Animator"
import { Dude } from "../../Dude"
import { WeaponSpec } from "../MeleeWeapon"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

// TODO use this
const animation: { angle: number; offset: Point; duration: number }[] = [
    { angle: 0, offset: pt(0, 0), duration: 40 },
    { angle: 15, offset: pt(3, 0), duration: 40 },
    { angle: 45, offset: pt(6, 0), duration: 40 },
    { angle: 90, offset: pt(4, 4), duration: 40 },
    { angle: 90, offset: pt(3, 4), duration: 40 },
    { angle: 90, offset: pt(2, 4), duration: 40 },
    { angle: 60, offset: pt(1, 4), duration: 40 },
    { angle: 15, offset: pt(3, 0), duration: 40 },
]

export class BasicAttackAnimation extends MeleeAnimation {
    private animator: Animator

    constructor(spec: WeaponSpec, onFinish: () => void) {
        super(spec)
        this.animator = new Animator(Animator.frames(8, 40), () => {}, onFinish)
        for (let i = 0; i < 8; i++) {
            console.log(this.getAttackAnimationPosition(i))
        }
    }

    update(elapsedTimeMillis: number): void {
        this.animator.update(elapsedTimeMillis)
    }

    // TODO add slash sprite
    getFrame(
        dude: Dude,
        spriteCache: WeaponSpriteCache
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        const [offset, rotation] = this.getAttackAnimationPosition()
        return this.getFrameBase(dude, spriteCache, rotation, offset)
    }

    private getAttackAnimationPosition(frame = this.animator.getCurrentFrame()): [Point, number] {
        const swingStartFrame = 3
        const resettingFrame = 7
        if (frame < swingStartFrame) {
            return [new Point(frame * 3, 0), 0]
        } else if (frame < resettingFrame) {
            return [new Point(16 - frame - swingStartFrame * 3, 4), 90]
        } else {
            return [new Point((1 - frame + resettingFrame) * 3, 0), 0]
        }
    }
}
