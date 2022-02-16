import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Animator } from "brigsby/dist/util/Animator"

/**
 * Something that can be lightly nudged when a dude walks through it
 */
export class Pushable extends Component {
    readonly position: Point
    private tileTransforms: Map<SpriteTransform, Point>
    private animator: Animator
    private canPush: () => boolean

    /**
     * @param position world pixel position (probably centered) referenced for finding hittables
     * @param tileTransforms the tiles which will be moved
     */
    constructor(position: Point, tileTransforms: SpriteTransform[], canPush: () => boolean) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map((t) => [t, t.position]))
        this.canPush = canPush
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    push(dudeStandingPosition: Point, dudeWalkingVelocity: Point) {
        if (
            !!this.animator ||
            !this.entity ||
            (dudeWalkingVelocity.x === 0 && dudeWalkingVelocity.y === 0) ||
            dudeStandingPosition.distanceTo(this.position) > 12
        ) {
            return
        }

        // perpendicular to the walking direction
        let velocity = new Point(dudeWalkingVelocity.y, -dudeWalkingVelocity.x)
        if (
            dudeStandingPosition.distanceTo(this.position) >
            dudeStandingPosition.distanceTo(this.position.plus(velocity))
        ) {
            velocity = velocity.times(-1)
        }

        const frames = [0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        this.animator = new Animator(
            Animator.frames(frames.length, 40),
            (index) => {
                if (this.canPush()) {
                    this.tileTransforms.forEach(
                        (pt, tr) => (tr.position = pt.plus(velocity.times(frames[index])))
                    )
                }
            },
            () => (this.animator = null)
        )
    }
}
