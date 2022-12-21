import { Point } from "brigsby/dist/Point"
import { session } from "../../online/session"
import { Condition } from "../Condition"
import { DudeType } from "../DudeType"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

enum State {
    DRAWN,
    ATTACKING,
}

// TODO: Why doesn't UNARMED work for players?
export class UnarmedWeapon extends Weapon {
    private state: State = State.DRAWN

    getType() {
        return WeaponType.UNARMED
    }

    isAttacking() {
        return this.state === State.ATTACKING
    }

    setSheathed(sheathed: boolean) {
        /* no-op */
    }

    isSheathed() {
        return false
    }

    getRange(): number {
        return 15
    }

    attack(newAttack: boolean) {
        if (this.state === State.ATTACKING || session.isGuest()) {
            return
        }
        if (!newAttack) {
            return
        }
        const enemies = Weapon.getEnemiesInRange(this.dude, this.getRange() * 1.5)
        if (enemies.length === 0 && this.dude.type !== DudeType.PLAYER) {
            return
        }

        this.state = State.ATTACKING

        const closestEnemy = enemies[0]
        const attackDir = !closestEnemy
            ? this.getAimingDirection()
            : closestEnemy.standingPosition.minus(this.dude.standingPosition)

        this.pounce(attackDir)

        closestEnemy?.damage(this.getDamageAmount(), {
            direction: closestEnemy.standingPosition.minus(this.dude.standingPosition),
            knockback: 50,
            attacker: this.dude,
            condition:
                this.dude.type === DudeType.SHROOM && Math.random() > 0.5
                    ? Condition.POISONED
                    : undefined,
            conditionDuration: 5_000 + Math.random() * 5_000,
        })

        setTimeout(() => (this.state = State.DRAWN), this.getMillisBetweenAttacks())
    }

    getMillisBetweenAttacks(): number {
        return 1_000
    }

    getWrappedRenderMethods() {
        return []
    }

    private pounce(direction: Point) {
        this.dude.knockback(direction, 30)
    }

    private getDamageAmount() {
        switch (this.dude.type) {
            case DudeType.BEAR:
            case DudeType.DEMON_BRUTE:
                return 3
            default:
                return 1
        }
    }
}
