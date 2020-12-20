import { Component } from "../../../engine/component"
import { Point } from "../../../engine/point"
import { LocationManager } from "../../world/LocationManager"
import { Dude } from "../Dude"
import { MeleeWeapon } from "./MeleeWeapon"
import { UnarmedWeapon } from "./UnarmedWeapon"
import { WeaponType } from "./WeaponType"

export abstract class Weapon extends Component {

    protected dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    // TODO find a better place for this?
    static getEnemiesInRange(attacker: Dude, attackDistance: number) {
        return Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => !!d && d !== attacker && d.faction !== attacker.faction)
                .filter(d => attacker.isFacing(d.standingPosition))
                .filter(d => d.standingPosition.distanceTo(attacker.standingPosition) < attackDistance)
    }

    abstract getType(): WeaponType
    abstract setDelayBetweenAttacks(delayMillis: number)
    abstract isAttacking()
    abstract toggleSheathed()
    abstract getRange(): number

    /**
     * This can be called every single frame and should handle that appropriately
     */
    abstract attack()
}
