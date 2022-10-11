import { Component, Entity, Point, pt } from "brigsby/dist"
import { EllipseRender } from "brigsby/dist/renderer"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"

class MagicProjectile extends Component {
    constructor(centerPosition: Point, velocity: Point, attacker?: Dude) {
        super()
        const size = pt(10)

        this.update = ({ elapsedTimeMillis }) => {
            centerPosition = centerPosition.plus(velocity.times(elapsedTimeMillis))
        }

        this.getRenderMethods = () => {
            return [
                new EllipseRender({
                    depth: centerPosition.y + size.y / 2,
                    position: centerPosition.minus(size.div(2)),
                    dimensions: size,
                }),
            ]
        }
    }
}

export const spawnMagicProjectile = (
    // sprite: SpriteComponent,
    centerPosition: Point,
    velocity: Point,
    attacker?: Dude
) => {
    here().droppedItems.add(new Entity([new MagicProjectile(centerPosition, velocity, attacker)]))
}
