import { Component, Point, UpdateData } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"

/**
 * Something that can be lightly nudged when a dude walks through it
 */
export class Pushable extends Component {
    readonly position: Point
    private tileTransforms: Map<SpriteTransform, Point>
    private animator: Animator
    private canPush: () => boolean
    private onPush: (dude: Dude) => void

    /**
     * @param position world pixel position (probably centered) referenced for finding hittables
     * @param tileTransforms the tiles which will be moved
     */
    constructor(
        position: Point,
        tileTransforms: SpriteTransform[],
        canPush: () => boolean,
        onPush: (dude: Dude) => void
    ) {
        super()
        this.position = position
        this.tileTransforms = new Map(tileTransforms.map((t) => [t, t.position]))
        this.canPush = canPush
        this.onPush = onPush
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    push(dude: Dude, dudeWalkingVelocity: Point) {
        if (
            !!this.animator ||
            !this.entity ||
            (dudeWalkingVelocity.x === 0 && dudeWalkingVelocity.y === 0) ||
            dude.standingPosition.distanceTo(this.position) > 12
        ) {
            return
        }

        // perpendicular to the walking direction
        let velocity = new Point(dudeWalkingVelocity.y, -dudeWalkingVelocity.x)
        if (
            dude.standingPosition.distanceTo(this.position) >
            dude.standingPosition.distanceTo(this.position.plus(velocity))
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

        this.onPush(dude)
    }
}
