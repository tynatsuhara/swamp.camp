import { Component } from "../../../engine/Component"
import { LocationManager } from "../../world/LocationManager"
import { Dude } from "../Dude"
import { WeaponType } from "./WeaponType"
import { Hittable } from "../../world/elements/Hittable"
import { Point } from "../../../engine/Point"

export abstract class Weapon extends Component {

    protected dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    // TODO find a better place for these static functions?
    static getEnemiesInRange(attacker: Dude, attackDistance: number) {
        return Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => !!d && d !== attacker && d.isEnemy(attacker))
                .filter(d => attacker.isFacing(d.standingPosition))
                .filter(d => d.standingPosition.distanceTo(attacker.standingPosition) < attackDistance)
    }

    static hitResources(dude: Dude) {
        const interactDistance = 20
        const interactCenter = dude.standingPosition.minus(new Point(0, 7))
        const possibilities = LocationManager.instance.currentLocation.getElements()
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

    /**
     * Used to determine if a shield can block
     */
    abstract isAttacking()
    abstract toggleSheathed()
    abstract getRange(): number

    /**
     * This can be called every single frame and should handle that appropriately
     * @param newAttack should be true if this is a new attack, false otherwise 
     * (this is useful for weapons that involve charging up, such as the spear)
     */
    abstract attack(newAttack: boolean)

    /**
     * This will be called on any frame that attack() is not called
     */
    cancelAttack() {}
}
