import { Component, Point, UpdateData } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"
import { isGamePaused } from "../../core/PauseState"

export class Hittable extends Component {
    extraRange = 0
    readonly position: Point
    private tileTransforms: Map<SpriteTransform, Point>
    private animator: Animator
    private readonly onHit: (dir: Point, hitter: Dude) => void

    /**
     * @param position world pixel position (probably centered) referenced for finding hittables
     * @param tileTransforms the tiles which will be moved
     */
    constructor(
        position: Point,
        tileTransforms: SpriteTransform[],
        onHit: (dir: Point, hitter: Dude) => void
    ) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map((t) => [t, t.position]))
        this.onHit = onHit
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    // TODO limit to certain tools
    hit(dir: Point, dude: Dude) {
        if (this.isBeingHit()) {
            return
        }

        dir = dir.normalized()
        const frames = [0, 0, 0, 3, 6, 3, 2, 1]

        this.animator = new Animator(
            Animator.frames(frames.length, 40),
            (index) => {
                this.tileTransforms.forEach(
                    (pt, tr) => (tr.position = pt.plus(dir.times(frames[index])))
                )
            },
            () => (this.animator = null),
            isGamePaused
        )

        setTimeout(() => this.onHit(dir, dude), 150)
    }

    isBeingHit() {
        return !!this.animator || !this.entity
    }
}
