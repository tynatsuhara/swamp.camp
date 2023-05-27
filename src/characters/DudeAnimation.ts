import { Component, pt, UpdateData } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { AnimatedSpriteComponent, ImageFilter, SpriteTransform } from "brigsby/dist/sprites"
import { ImageFilters } from "../graphics/ImageFilters"
import { Color } from "../ui/Color"
import { Dude } from "./Dude"
import { DudeAnimationUtils } from "./DudeAnimationUtils"

/**
 * Wraps multiple animations and dude-animation-specific logic
 */
export class DudeAnimation extends Component {
    private _animation: AnimatedSpriteComponent
    private _transform: SpriteTransform
    get transform() {
        return this._transform
    }
    get sprite() {
        return this._animation.sprite
    }

    constructor(private dude: Dude, readonly animationName: string) {
        super()
        const idleAnim = DudeAnimationUtils.getCharacterIdleAnimation(this.animationName, dude.blob)
        const runAnim = DudeAnimationUtils.getCharacterWalkAnimation(this.animationName, dude.blob)
        const jumpAnim = DudeAnimationUtils.getCharacterJumpAnimation(this.animationName, dude.blob)
        const height = idleAnim.getSprite(0).dimensions.y
        this._animation = new AnimatedSpriteComponent(
            [idleAnim, runAnim, jumpAnim],
            new SpriteTransform(pt(0, 28 - height))
        )
        this._transform = this._animation.transform
    }

    update(updateData: UpdateData) {
        this._animation.update(updateData)
    }

    private flashUntil: number = 0
    flash() {
        this.flashUntil = Date.now() + 40
    }

    private cachedAfterDissolve: RenderMethod[]
    getRenderMethods() {
        // optimization to avoid running this filter every frame
        if (this.cachedAfterDissolve) {
            return this.cachedAfterDissolve
        }

        const doFlash = !!this.flashUntil
        if (this.flashUntil < Date.now()) {
            this.flashUntil = 0
        }

        const flashFilter = doFlash ? ImageFilters.tint(Color.WHITE) : null

        const compositeFilter = ImageFilters.composite(flashFilter, this.dissolveFilter)

        const result: RenderMethod[] = [
            this._animation.sprite.filtered(compositeFilter).toImageRender(this._transform),
        ]

        if (this.dude.shield?.isStarted) {
            result.push(...(this.dude.shield.getWrappedRenderMethods(compositeFilter) ?? []))
        }
        if (this.dude.weapon?.isStarted) {
            result.push(...(this.dude.weapon.getWrappedRenderMethods(compositeFilter) ?? []))
        }

        if (this.dissolveFilter) {
            this.cachedAfterDissolve = result
        }

        return result
    }

    fastForward(ms: number) {
        this._animation.fastForward(ms)
    }

    currentFrame(): number {
        return this._animation.currentFrame()
    }

    // TODO improve API
    goToAnimation(index: number) {
        this._animation.goToAnimation(index)
    }

    private dissolveFilter: ImageFilter
    applyDissolveFilter(dissolveChance: number) {
        this.cachedAfterDissolve = undefined
        this.dissolveFilter = ImageFilters.dissolve(() => dissolveChance)
    }

    pause() {
        this._animation.pause()
    }
}
