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

    toggleSheathed() {
        /* no-op */
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
        closestEnemy.damage(
            this.getDamageAmount(),
            closestEnemy.standingPosition.minus(this.dude.standingPosition),
            50,
            this.dude
        )

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
