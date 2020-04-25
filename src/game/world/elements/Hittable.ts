import { Component } from "../../../engine/component";
import { Point } from "../../../engine/point"
import { Animator } from "../../../engine/util/Animator"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { UpdateData } from "../../../engine/engine"

export class Hittable extends Component {

    readonly position: Point
    private tileTransforms: Map<TileTransform, Point>
    private animator: Animator

    /**
     * @param position world pixel position
     */
    constructor(position: Point, tileTransforms: TileTransform[]) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map(t => [t, t.position]))
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    // TODO limit to certain tools 
    hit(dir: Point) {
        if (!!this.animator) {  // already being hit
            return 
        }
        
        dir = dir.normalized()
        const frames = [0, 0, 0, 3, 6, 3, 2, 1]

        this.animator = new Animator(
            Animator.frames(frames.length, 40), 
            index => {
                this.tileTransforms.forEach((pt, tr) => tr.position = pt.plus(dir.times(frames[index])))
            }, 
            () => this.animator = null
        ) 
    }
}