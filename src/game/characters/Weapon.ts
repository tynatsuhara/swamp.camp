import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets } from "../graphics/Tilesets"
import { UpdateData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "./Dude"
import { Animator } from "../../engine/util/Animator"
import { LocationManager } from "../world/LocationManager"
import { TileSource } from "../../engine/tiles/TileSource"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { WeaponType } from "./WeaponType"

export const getWeaponComponent = (type: WeaponType): Weapon => {
    // TODO support additional weapons
    switch (type) {
        case WeaponType.NONE:
            return null
        case WeaponType.UNARMED:
            return new UnarmedWeapon()
        case WeaponType.SWORD:
            return new MeleeWeapon(WeaponType.SWORD, "weapon_regular_sword", new Point(-6, -2))
        case WeaponType.CLUB:
            return new MeleeWeapon(WeaponType.CLUB, "weapon_baton_with_spikes", new Point(-6, -2))
        case WeaponType.PICKAXE:
            return new MeleeWeapon(WeaponType.PICKAXE, "weapon_pickaxe", new Point(-5, -2))
        case WeaponType.AXE:
            return new MeleeWeapon(WeaponType.AXE, "weapon_axe", new Point(-3, -1))
        default:
            throw new Error(`weapon type ${type} is not supported yet`)
    }
}

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING
}

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

/**
 * TODO make this an abstract class, move melee-specific stuff to subclass
 * A weapon being wielded by a dude
 */
class MeleeWeapon extends Weapon {

    private weaponType: WeaponType
    private weaponSprite: StaticTileSource
    private weaponTransform: TileTransform
    private offsetFromCenter: Point
    private state: State = State.DRAWN
    // private slashSprite: TileComponent
    private _range: number
    private delayBetweenAttacks = 0  // delay after the animation ends before the weapon can attack again in millis

    constructor(weaponType: WeaponType, weaponId: string, offsetFromCenter: Point) {
        super()
        this.start = (startData) => {
            this.weaponSprite = Tilesets.instance.dungeonCharacters.getTileSource(weaponId)
            this.weaponTransform = new TileTransform(Point.ZERO, this.weaponSprite.dimensions).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = offsetFromCenter
            this._range = this.weaponSprite.dimensions.y
        }
        this.weaponType = weaponType
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }
    
    getRenderMethods() {
        return [this.weaponSprite.toImageRender(this.weaponTransform)]
    }

    getType() {
        return this.weaponType
    }

    setDelayBetweenAttacks(delayMs: number) {
        this.delayBetweenAttacks = delayMs
    }

    isAttacking() {
        return this.state === State.ATTACKING
    }

    toggleSheathed() {
        if (this.state === State.SHEATHED) {
            this.state = State.DRAWN
        } else if (this.state === State.DRAWN) {
            this.state = State.SHEATHED
        }
    }

    getRange() {
        return this._range
    }

    attack() {
        if (this.dude.shield && !this.dude.shield?.canAttack()) {
            return
        }
        if (this.state === State.DRAWN) {
            this.state = State.ATTACKING
            setTimeout(() => {
                if (!this.enabled) {
                    return
                }
                const attackDistance = this.getRange() + 4  // add a tiny buffer for small weapons like the dagger to still work
                // TODO maybe only allow big weapons to hit multiple targets
                Weapon.getEnemiesInRange(this.dude, attackDistance).forEach(d => {
                    d.damage(1, d.standingPosition.minus(this.dude.standingPosition), 30)
                })
            }, 100)
            this.playAttackAnimation()
        }
    }

    private animate() {
        const offsetFromEdge = new Point(
            this.dude.animation.transform.dimensions.x/2 - this.weaponTransform.dimensions.x/2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)

        let pos = new Point(0, 0)
        let rotation = 0

        if (this.state === State.DRAWN) {
            pos = offsetFromEdge
        } else if (this.state === State.SHEATHED) {  // TODO add side sheath for swords
            // center on back
            pos = offsetFromEdge.plus(new Point(3, -1))
        } else if (this.state === State.ATTACKING) {
            const posWithRotation = this.getAttackAnimationPosition()
            pos = posWithRotation[0].plus(offsetFromEdge)
            rotation = posWithRotation[1]
        }

        this.weaponTransform.rotation = rotation
        this.weaponTransform.mirrorY = this.state == State.SHEATHED

        pos = pos.plus(this.dude.getAnimationOffsetPosition())

        this.weaponTransform.position = pos

        // show sword behind character if sheathed
        this.weaponTransform.depth = this.state == State.SHEATHED ? -.5 : .5
        // this.weaponSprite.transform.mirrorX = charMirror

        // TODO maybe keep the slash stuff later
        // this.slashSprite.enabled = this.animator?.getCurrentFrame() === 3
        // this.slashSprite.transform.depth = characterAnim.transform.depth + 2
        // this.slashSprite.transform.mirrorX = charMirror
        // this.slashSprite.transform.position = characterAnim.transform.position.plus(
        //     new Point((charMirror ? -1 : 1) * (this.weaponSprite.transform.dimensions.y - 8), 8)
        // )
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(8, 40), 
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.animator = null
                setTimeout(() => {
                    this.state = State.DRAWN  // reset to DRAWN when animation finishes
                }, this.delayBetweenAttacks)
            }
        ) 
    }

    /**
     * Returns (position, rotation)
     */
    private getAttackAnimationPosition(): [Point, number] {
        const swingStartFrame = 3
        const resettingFrame = 7

        if (this.currentAnimationFrame < swingStartFrame) {
            return [new Point(this.currentAnimationFrame * 3, 0), 0]
        } else if (this.currentAnimationFrame < resettingFrame) {
            return [
                new Point(
                    (6-this.currentAnimationFrame) + this.weaponTransform.dimensions.y - swingStartFrame*3, 
                    Math.floor(this.weaponTransform.dimensions.y/2 - 1)
                ),
                90
            ]
        } else {
            return [new Point((1-this.currentAnimationFrame+resettingFrame) * 3, 2), 0]
        }
    }
}

class UnarmedWeapon extends Weapon {

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