import { Point } from "../point";
import { UpdateData } from "../engine";
import { TileComponent } from "./TileComponent";
import { TileSetAnimation } from "./TileSetAnimation";

export class AnimatedTileComponent extends TileComponent {
    private animator: TileSetAnimator;

    constructor(animation: TileSetAnimation, position: Point = new Point(0, 0)) {
        const animator = new TileSetAnimator(animation);
        super(animator.getCurrentTileSource(), position);
        this.animator = animator;
    }
    
    update(updateData: UpdateData) {
        this.tileSource = this.animator.update(updateData.elapsedTimeMillis);
    }
}

class TileSetAnimator {
    animation: TileSetAnimation
    time: number = 0
    index: number = 0

    constructor(animation: TileSetAnimation) {
        this.animation = animation
    }

    update(elapsedTimeMillis: number) {
        this.time += elapsedTimeMillis
        while (this.time > this.animation.frames[this.index][1]) {
            this.index++
            this.index %= this.animation.frames.length
            this.time %= this.animation.duration
        }
        return this.getCurrentTileSource()
    }

    getCurrentTileSource() {
        return this.animation.frames[this.index][0]
    }
}