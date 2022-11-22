import { Component, Entity, Point } from "brigsby/dist"
import { Tilesets } from "../../graphics/Tilesets"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"

class MagicProjectile extends Component {
    constructor(centerPosition: Point, velocity: Point, attacker?: Dude) {
        super()

        this.update = ({ elapsedTimeMillis }) => {
            centerPosition = centerPosition.plus(velocity.times(elapsedTimeMillis))
        }

        this.getRenderMethods = () => {
            return [Tilesets.instance.explosions.getSprite(centerPosition)]
        }
    }
}

export const spawnMagicProjectile = (
    // sprite: SpriteComponent,
    centerPosition: Point,
    velocity: Point,
    attacker?: Dude
) => {
    here().miscEntities.add(new Entity([new MagicProjectile(centerPosition, velocity, attacker)]))
}
