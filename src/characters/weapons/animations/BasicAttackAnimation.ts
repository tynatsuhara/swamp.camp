import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Animator } from "brigsby/dist/util/Animator"
import { isGamePaused } from "../../../core/PauseState"
import { Tilesets } from "../../../graphics/Tilesets"
import { AnimationArgs, MeleeAnimation } from "./MeleeAnimation"

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

    constructor(args: AnimationArgs, onFinish: () => void) {
        super(args)
        this.animator = new Animator(
            Animator.frames(8, 40 / args.spec.speed),
            () => {},
            onFinish,
            isGamePaused
        )
        this.slashSprite = Tilesets.instance.oneBit.getTileSource("slash")
    }

    update(elapsedTimeMillis: number): void {
        this.animator.update(elapsedTimeMillis)
    }

    getFrame() {
        const [offset, rotation] = this.getAttackAnimationPosition()
        return [this.getFrameBase(rotation, offset), ...this.getSlashSpriteFrame()]
    }

    getSlashSpriteFrame() {
        if (this.animator.getCurrentFrame() !== 3) {
            return []
        }
        const transform = SpriteTransform.new({
            depth: this.dude.animation.transform.depth + 2,
            mirrorX: this.dude.getFacingMultiplier() === -1,
            position: this.dude.animation.transform.position.plus(
                new Point(
                    this.dude.getFacingMultiplier() *
                        (this.spriteCache.get(0).sprite.dimensions.y - 10),
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
