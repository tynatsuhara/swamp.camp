import { Component, Entity, Point } from "brigsby/dist"
import { Tilesets } from "../../graphics/Tilesets"
import { here } from "../../world/locations/LocationManager"
import { Dude } from "../Dude"

class MagicProjectile extends Component {
    constructor(private centerPosition: Point, private velocity: Point, attacker?: Dude) {
        super()
    }
    update({ elapsedTimeMillis }) {
        this.centerPosition = this.centerPosition.plus(this.velocity.times(elapsedTimeMillis))
    }

    getRenderMethods() {
        return [Tilesets.instance.explosions.getSprite(this.centerPosition)]
    }
}

export const spawnMagicProjectile = (
    // sprite: SpriteComponent,
    centerPosition: Point,
    velocity: Point,
    attacker?: Dude
) => {
    here().addProjectile(new Entity([new MagicProjectile(centerPosition, velocity, attacker)]))
}
