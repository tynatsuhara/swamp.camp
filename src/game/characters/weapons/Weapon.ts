import { Component } from "../../../engine/component"
import { LocationManager } from "../../world/LocationManager"
import { Dude } from "../Dude"
import { WeaponType } from "./WeaponType"
import { Hittable } from "../../world/elements/Hittable"
import { Point } from "../../../engine/point"

export abstract class Weapon extends Component {

    protected dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    // TODO find a better place for these static functions?
    static getEnemiesInRange(attacker: Dude, attackDistance: number) {
        return Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => !!d && d !== attacker && d.faction !== attacker.faction)
                .filter(d => attacker.isFacing(d.standingPosition))
                .filter(d => d.standingPosition.distanceTo(attacker.standingPosition) < attackDistance)
    }

    static hitResources(dude: Dude) {
        const interactDistance = 20
        const interactCenter = dude.standingPosition.minus(new Point(0, 7))
        const possibilities = LocationManager.instance.currentLocation.elements.values()
                .map(e => e.entity.getComponent(Hittable))
                .filter(e => !!e)
                .filter(e => dude.isFacing(e.position))
        
        let closestDist = Number.MAX_SAFE_INTEGER
        let closest: Hittable
        for (const i of possibilities) {
            const dist = i.position.distanceTo(interactCenter)
            if (dist < interactDistance && dist < closestDist) {
                closestDist = dist
                closest = i
            }
        }

        closest?.hit(closest.position.minus(interactCenter))
    }

    abstract getType(): WeaponType
    abstract setDelayBetweenAttacks(delayMillis: number)

    /**
     * Used to determine if a shield can block
     */
    abstract isAttacking()
    abstract toggleSheathed()
    abstract getRange(): number

    /**
     * This can be called every single frame and should handle that appropriately
     */
    abstract attack()

    /**
     * This will be called on any frame that attack() is not called
     */
    cancelAttack() {}
}
