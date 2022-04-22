import { Condition } from "../Condition"
import { DudeType } from "../DudeFactory"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

enum State {
    DRAWN,
    ATTACKING,
}

export class UnarmedWeapon extends Weapon {
    private state: State = State.DRAWN
    private delay: number

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
        if (this.state === State.ATTACKING) {
            return
        }
        if (!newAttack) {
            return
        }
        const enemies = Weapon.getEnemiesInRange(this.dude, this.getRange() * 1.5)
        if (enemies.length === 0) {
            return
        }
        this.state = State.ATTACKING

        const closestEnemy = enemies[0]
        const attackDir = closestEnemy.standingPosition.minus(this.dude.standingPosition)

        this.dude.knockback(attackDir, 30) // pounce

        closestEnemy.damage(this.getDamageAmount(), {
            direction: closestEnemy.standingPosition.minus(this.dude.standingPosition),
            knockback: 50,
            attacker: this.dude,
            condition:
                this.dude.type === DudeType.SHROOM && Math.random() > 0.5
                    ? Condition.POISONED
                    : undefined,
            conditionDuration: 5_000 + Math.random() * 5_000,
        })

        setTimeout(() => (this.state = State.DRAWN), this.delay)
    }

    private getDamageAmount() {
        switch (this.dude.type) {
            case DudeType.BEAR:
            case DudeType.DEMON_BRUTE:
                return 3
            case DudeType.SWAMP_THING:
                return 2
            default:
                return 1
        }
    }
}
