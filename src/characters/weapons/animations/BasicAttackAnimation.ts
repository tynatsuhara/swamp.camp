import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Animator } from "brigsby/dist/util/Animator"
import { Tilesets } from "../../../graphics/Tilesets"
import { Dude } from "../../Dude"
import { WeaponSpec } from "../MeleeWeapon"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

// TODO use this if we can make it better than the existing animation
const FRAMERATE = 30
const ANIMATION: { angle: number; offset: Point }[] = [
    { angle: 0, offset: pt(0, 0) },
    { angle: 15, offset: pt(3, 0) },
    { angle: 30, offset: pt(4, 0) },
    { angle: 90, offset: pt(5, 2) },
    { angle: 90, offset: pt(6, 2) },
    { angle: 105, offset: pt(5, 2) },
    { angle: 105, offset: pt(4, 4) },
    // { angle: 120, offset: pt(3, 4) },
    // { angle: 120, offset: pt(2, 4) },
    // { angle: 135, offset: pt(2, 4) },
    // { angle: 135, offset: pt(2, 4) },
    // { angle: 120, offset: pt(2, 4) },
    { angle: 105, offset: pt(2, 4) },
    { angle: 90, offset: pt(2, 4) },
    { angle: 75, offset: pt(2, 3) },
    { angle: 60, offset: pt(3, 2) },
]

export class BasicAttackAnimation extends MeleeAnimation {
    private animator: Animator
    private readonly slashSprite: StaticSpriteSource

    constructor(spec: WeaponSpec, onFinish: () => void) {
        super(spec)
        this.animator = new Animator(Animator.frames(8, 40), () => {}, onFinish)
        this.slashSprite = Tilesets.instance.oneBit.getTileSource("slash")
    }

    update(elapsedTimeMillis: number): void {
        this.animator.update(elapsedTimeMillis)
    }

    getFrame(dude: Dude, spriteCache: WeaponSpriteCache) {
        const [offset, rotation] = this.getAttackAnimationPosition()
        return [
            this.getFrameBase(dude, spriteCache, rotation, offset),
            ...this.getSlashSpriteFrame(dude, spriteCache),
        ]
    }

    getSlashSpriteFrame(dude: Dude, spriteCache: WeaponSpriteCache) {
        if (this.animator.getCurrentFrame() !== 3) {
            return []
        }
        const transform = SpriteTransform.new({
            depth: dude.animation.transform.depth + 2,
            mirrorX: dude.getFacingMultiplier() === -1,
            position: dude.animation.transform.position.plus(
                new Point(
                    dude.getFacingMultiplier() * (spriteCache.get(0).sprite.dimensions.y - 10),
                    8
                )
            ),
        })
        return [{ sprite: this.slashSprite, transform }]
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
