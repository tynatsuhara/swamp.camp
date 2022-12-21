import { Component, pt, UpdateData } from "brigsby/dist"
import { AnimatedSpriteComponent, ImageFilter, SpriteTransform } from "brigsby/dist/sprites"
import { ImageFilters } from "../graphics/ImageFilters"
import { Color } from "../ui/Color"
import { Dude } from "./Dude"
import { DudeAnimationUtils } from "./DudeAnimationUtils"

/**
 * Wraps multiple animations and dude-animation-specific logic
 */
export class DudeAnimation extends Component {
    private dude: Dude
    private _animation: AnimatedSpriteComponent
    private _transform: SpriteTransform
    get transform() {
        return this._transform
    }
    get sprite() {
        return this._animation.sprite
    }

    readonly animationName: string

    constructor(dude: Dude, characterAnimName: string) {
        super()
        this.dude = dude
        this.animationName = characterAnimName
        const idleAnim = DudeAnimationUtils.getCharacterIdleAnimation(characterAnimName, dude.blob)
        const runAnim = DudeAnimationUtils.getCharacterWalkAnimation(characterAnimName, dude.blob)
        const jumpAnim = DudeAnimationUtils.getCharacterJumpAnimation(characterAnimName, dude.blob)
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

    getRenderMethods() {
        const doFlash = !!this.flashUntil
        if (this.flashUntil < Date.now()) {
            this.flashUntil = 0
        }

        const filter = doFlash ? ImageFilters.tint(Color.WHITE) : null

        const result = [
            this._animation.sprite.filtered(filter).toImageRender(this._transform),
            ...(this.dude.shield?.getWrappedRenderMethods(filter) ?? []),
            ...(this.dude.weapon?.getWrappedRenderMethods(filter) ?? []),
        ]

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

    applyFilter(filter: ImageFilter) {
        this._animation.applyFilter(filter)
    }

    pause() {
        this._animation.pause()
    }
}
