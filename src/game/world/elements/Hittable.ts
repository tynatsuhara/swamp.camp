import { Component } from "../../../engine/component";
import { Point } from "../../../engine/point"
import { Animator } from "../../../engine/util/Animator"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { UpdateData } from "../../../engine/engine"
import { spawnItem } from "../../items/Items"

export class Hittable extends Component {

    readonly position: Point
    private tileTransforms: Map<TileTransform, Point>
    private animator: Animator
    private readonly onHit: (dir: Point) => void

    /**
     * @param position world pixel position (probably centered) referenced for finding hittables
     */
    constructor(position: Point, tileTransforms: TileTransform[], onHit: (dir: Point) => void) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map(t => [t, t.position]))
        this.onHit = onHit
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    // TODO limit to certain tools 
    hit(dir: Point) {
        if (!!this.animator || !this.entity) {  // already being hit
            return 
        }
        
        dir = dir.normalized()
        const frames = [0, 0, 0, 0, 0, 0, 0, 3, 6, 3, 2, 1]

        this.animator = new Animator(
            Animator.frames(frames.length, 40), 
            index => {
                this.tileTransforms.forEach((pt, tr) => tr.position = pt.plus(dir.times(frames[index])))
            }, 
            () => this.animator = null
        ) 

        setTimeout(() => this.onHit(dir), 150)
    }
}