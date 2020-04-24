import { Point } from "../point"
import { UpdateData } from "../engine"
import { TileComponent } from "./TileComponent"
import { TileSetAnimation } from "./TileSetAnimation"
import { TileSource } from "./TileSource"
import { Animator } from "../util/Animator"
import { TileTransform } from "./TileTransform"

export class AnimatedTileComponent extends TileComponent {
    paused: boolean 

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
        this.play(0)
    }

    currentFrame() {
        return this.animator.getCurrentFrame()
    }

    play(animation: number) {
        const anim = this.animations[animation]
        this.animator = new Animator(
            anim.frames.map(f => f[1]), 
            (index) => {
                this.tileSource = anim.getTile(index)
            }
        )
    }
    
    update(updateData: UpdateData) {
        if (!this.paused) {
            this.animator.update(updateData.elapsedTimeMillis)
        }
    }
}
