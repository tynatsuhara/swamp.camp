import { Point } from "../point"
import { UpdateData } from "../engine"
import { TileComponent } from "./TileComponent"
import { TileSetAnimation } from "./TileSetAnimation"
import { TileSource } from "./TileSource"

export class AnimatedTileComponent extends TileComponent {
    private animator: TileSetAnimator
    private animations: TileSetAnimation[]

    // defaultAnimation has a key of 0, the following is 1, etc
    constructor(position: Point, defaultAnimation: TileSetAnimation, ...additionalAnimations: TileSetAnimation[]) {
        const animator = new TileSetAnimator(defaultAnimation)
        super(animator.getCurrentTileSource(), position)
        this.animator = animator
        this.animations = [defaultAnimation].concat(additionalAnimations)
    }

    play(animation: number) {
        this.animator = new TileSetAnimator(this.animations[animation])
    }
    
    update(updateData: UpdateData) {
        this.tileSource = this.animator.update(updateData.elapsedTimeMillis)
    }
}

class TileSetAnimator {
    animation: TileSetAnimation
    time: number = 0
    index: number = 0

    constructor(animation: TileSetAnimation) {
        this.animation = animation
    }

    update(elapsedTimeMillis: number): TileSource {
        this.time += elapsedTimeMillis
        while (this.time > this.animation.frames[this.index][1]) {
            this.index++
            this.index %= this.animation.frames.length
            this.time %= this.animation.duration
        }
        return this.getCurrentTileSource()
    }

    getCurrentTileSource(): TileSource {
        return this.animation.frames[this.index][0]
    }
}