import { Component, Point, UpdateData } from "brigsby/lib"
import { SpriteTransform } from "brigsby/lib/sprites"
import { Animator } from "brigsby/lib/util"

export class Hittable extends Component {
    readonly position: Point
    private tileTransforms: Map<SpriteTransform, Point>
    private animator: Animator
    private readonly onHit: (dir: Point) => void

    /**
     * @param position world pixel position (probably centered) referenced for finding hittables
     * @param tileTransforms the tiles which will be moved
     */
    constructor(position: Point, tileTransforms: SpriteTransform[], onHit: (dir: Point) => void) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map((t) => [t, t.position]))
        this.onHit = onHit
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    // TODO limit to certain tools
    hit(dir: Point) {
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
            () => (this.animator = null)
        )

        setTimeout(() => this.onHit(dir), 150)
    }

    isBeingHit() {
        return !!this.animator || !this.entity
    }
}
