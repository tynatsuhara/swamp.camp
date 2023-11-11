import { Point, pt, UpdateData } from "brigsby/dist"
import { ImageFilter } from "brigsby/dist/sprites"
import { controls } from "../../core/Controls"
import { Tilesets } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { setGameTimeout } from "../../world/events/setGameTimeout"
import { Dude } from "../Dude"
import { player } from "../player/index"
import { BasicAttackAnimation } from "./animations/BasicAttackAnimation"
import { IdleAnimation } from "./animations/IdleAnimation"
import { AnimationArgs, MeleeAnimation } from "./animations/MeleeAnimation"
import { SheathedAnimation } from "./animations/SheathedAnimation"
import { HAND_POSITION_OFFSET, Weapon } from "./Weapon"
import { WeaponSpriteCache } from "./WeaponSpriteCache"
import { WeaponType } from "./WeaponType"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING,
}

export type WeaponSpec = {
    weaponType: WeaponType
    spriteId: string
    // the sprite will be positioned at the bottom center, this offset is relative to that
    offsetFromCenter: Point
    range: number
    damage: number
    canMultiAttack: boolean
    speed: number
}

// maps sprite ID to sprite cache
let spriteCaches: Record<string, WeaponSpriteCache> = {}

export class MeleeWeapon extends Weapon {
    private state: State = State.DRAWN

    private idleAnim: MeleeAnimation
    private sheathedAnim: MeleeAnimation
    private attackAnim: MeleeAnimation
    private animationArgs: AnimationArgs

    constructor(private spec: WeaponSpec) {
        super()
        const { spriteId } = spec

        this.start = () => {
            const baseSprite = Tilesets.instance.dungeonCharacters.getTileSource(spriteId)
            const baseDims = baseSprite.dimensions
            spec.offsetFromCenter = spec.offsetFromCenter.minus(pt(baseDims.x / 2, baseDims.y))

            spriteCaches[spriteId] =
                spriteCaches[spriteId] ??
                new WeaponSpriteCache(baseSprite, HAND_POSITION_OFFSET.minus(spec.offsetFromCenter))

            this.animationArgs = {
                dude: this.dude,
                spec: this.spec,
                spriteCache: spriteCaches[spriteId],
            }

            this.idleAnim = new IdleAnimation(this.animationArgs)
            this.sheathedAnim = new SheathedAnimation(this.animationArgs)
        }
    }

    update({ elapsedTimeMillis }: UpdateData) {
        this.getCurrentAnimation().update(elapsedTimeMillis)
    }

    getType() {
        return this.spec.weaponType
    }

    isAttacking() {
        return this.state === State.ATTACKING
    }

    setSheathed(sheathed: boolean) {
        this.state = sheathed ? State.SHEATHED : State.DRAWN
    }

    isSheathed() {
        return this.state === State.SHEATHED
    }

    getRange() {
        return this.spec.range
    }

    attack(newAttack: boolean) {
        if (this.dude.shield && !this.dude.shield?.canAttack()) {
            return
        }
        if (newAttack && this.state === State.DRAWN) {
            const onFinish = () => (this.state = State.DRAWN)
            // TODO: Use multiple animations and combos
            // this.attackAnim = new FullSpinAnimation(this.animationArgs, onFinish)
            this.attackAnim = new BasicAttackAnimation(this.animationArgs, onFinish)
            this.state = State.ATTACKING
            // TODO trigger from animation
            setGameTimeout(() => this.damageEnemies(), 100 / this.spec.speed)
        }
    }

    private damageEnemies() {
        if (!this.enabled) {
            return
        }

        const attackDistance = this.getRange() + 4 // add a tiny buffer for small weapons like the dagger to still work

        const enemies = Weapon.getEnemiesInRange(this.dude, attackDistance)

        if (session.isHost()) {
            const damageEnemy = (d: Dude) => {
                d.damage(this.spec.damage, {
                    direction: d.standingPosition.minus(this.dude.standingPosition),
                    knockback: 30,
                    attacker: this.dude,
                })
            }
            if (this.spec.canMultiAttack) {
                enemies.forEach(damageEnemy)
            } else if (enemies.length > 0) {
                damageEnemy(enemies[0])
            }
        }

        if (enemies.length === 0) {
            Weapon.hitResources(this.dude)
        }
        const hitResource = enemies.length === 0 && Weapon.hitResources(this.dude)

        this.dude.onAttackCallback({
            weapon: this.getType(),
            hitEnemy: enemies.length > 0,
            hitResource,
        })

        if (this.dude === player() && (enemies.length > 0 || hitResource)) {
            setGameTimeout(() => {
                controls.vibrate({
                    duration: 70,
                    strongMagnitude: 0.5,
                    weakMagnitude: 0.075,
                })
            }, 100)
        }
    }

    getWrappedRenderMethods(filter: ImageFilter) {
        return this.getCurrentAnimation()
            .getFrame()
            .map(({ sprite, transform }) => sprite.filtered(filter).toImageRender(transform))
    }

    private getCurrentAnimation() {
        if (this.state === State.DRAWN) {
            return this.idleAnim
        } else if (this.state === State.SHEATHED) {
            return this.sheathedAnim
        } else if (this.state === State.ATTACKING) {
            return this.attackAnim
        }
    }
}
