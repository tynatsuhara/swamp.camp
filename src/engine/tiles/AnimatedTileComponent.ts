import { UpdateData } from "../Engine"
import { Animator } from "../util/Animator"
import { TileComponent } from "./TileComponent"
import { TileSetAnimation } from "./TileSetAnimation"
import { TileTransform } from "./TileTransform"

export class AnimatedTileComponent extends TileComponent {
    private animator: Animator
    private animations: TileSetAnimation[]

    // defaultAnimation has a key of 0, the following is 1, etc
    constructor(animations: TileSetAnimation[], transform: TileTransform = new TileTransform()) {
        if (animations.length < 1) {
            throw new Error("needs at least one animation!")
        }
        const defaultAnimation = animations[0]
        super(defaultAnimation.getTile(0), transform)
        this.animations = animations
        this.goToAnimation(0)
    }

    currentFrame() {
        return this.animator.getCurrentFrame()
    }

    goToAnimation(animation: number) {
        const anim = this.animations[animation]
        this.animator = new Animator(
            anim.frames.map(f => f[1]), 
            index => {
                this.tileSource = anim.getTile(index)
            },
            anim.onFinish
        )
        return this
    }

    pause() {
        this.animator.paused = true
    }

    play() {
        this.animator.paused = false
    }
    
    update(updateData: UpdateData) {
        if (!this.animator.paused) {
            this.animator.update(updateData.elapsedTimeMillis)
        }
    }

    fastForward(ms: number) {
        this.animator.update(Math.floor(ms))
    }

    // This won't currently refresh the animation
    applyFilter(filter: (img: ImageData) => ImageData) {
        this.animations = this.animations.map(a => a?.filtered(filter))
    }
}
