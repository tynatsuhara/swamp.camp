import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

enum State {
    DRAWN,
    ATTACKING
}

export class UnarmedWeapon extends Weapon {

    private state: State = State.DRAWN
    private delay: number

    getType() {
        return WeaponType.UNARMED
    }

    setDelayBetweenAttacks(delayMillis: number) {
        this.delay = delayMillis
    }

    isAttacking() {
        return this.state === State.ATTACKING
    }

    toggleSheathed() { /* no-op */ }

    getRange(): number {
        return 15
    }

    attack() {
        if (this.state === State.ATTACKING) {
            return
        }
        const enemies = Weapon.getEnemiesInRange(this.dude, this.getRange() * 1.5)
        if (enemies.length === 0) {
            return
        }
        this.state = State.ATTACKING

        const closestEnemy = enemies[0]
        const attackDir = closestEnemy.standingPosition.minus(this.dude.standingPosition)
        this.dude.knockback(attackDir, 30)  // pounce
        closestEnemy.damage(1, closestEnemy.standingPosition.minus(this.dude.standingPosition), 50)

        setTimeout(() => this.state = State.DRAWN, this.delay)
    }
}