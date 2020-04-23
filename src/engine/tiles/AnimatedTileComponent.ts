import { Point } from "../point"
import { UpdateData } from "../engine"
import { TileComponent } from "./TileComponent"
import { TileSetAnimation } from "./TileSetAnimation"
import { TileSource } from "./TileSource"
import { Animator } from "../util/Animator"

export class AnimatedTileComponent extends TileComponent {
    private animator: Animator
    private animations: TileSetAnimation[]

    // defaultAnimation has a key of 0, the following is 1, etc
    constructor(position: Point, defaultAnimation: TileSetAnimation, ...additionalAnimations: TileSetAnimation[]) {
        super(defaultAnimation.getTile(0), position)
        this.animations = [defaultAnimation].concat(additionalAnimations)
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
        this.animator.update(updateData.elapsedTimeMillis)
    }
}
