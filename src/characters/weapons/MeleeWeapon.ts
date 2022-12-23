import { Point, UpdateData } from "brigsby/dist"
import { ImageFilter, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
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
    offsetFromCenter: Point
    range: number
    damage: number
    canMultiAttack: boolean
    speed: number // TODO
}

// maps sprite ID to sprite cache
let spriteCaches: Record<string, WeaponSpriteCache> = {}

export class MeleeWeapon extends Weapon {
    private spec: WeaponSpec

    private state: State = State.DRAWN

    private idleAnim: MeleeAnimation
    private sheathedAnim: MeleeAnimation
    private attackAnim: MeleeAnimation
    private animationArgs: AnimationArgs

    constructor(spec: WeaponSpec) {
        super()
        this.spec = spec
        const { spriteId, offsetFromCenter } = spec

        this.start = () => {
            spriteCaches[spriteId] =
                spriteCaches[spriteId] ??
                new WeaponSpriteCache(
                    Tilesets.instance.dungeonCharacters.getTileSource(spriteId),
                    HAND_POSITION_OFFSET.minus(offsetFromCenter)
                )

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
            // this.attackAnim = new FullSpinAnimation(this.animationArgs, onFinish)
            this.attackAnim = new BasicAttackAnimation(this.animationArgs, onFinish)
            this.state = State.ATTACKING
            // TODO trigger from animation
            setTimeout(() => this.damageEnemies(), 100)
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

        if (this.dude.type === DudeType.PLAYER && enemies.length === 0) {
            Weapon.hitResources(this.dude)
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

    private getSpriteAndTransform(
        angle: number,
        offset = Point.ZERO
    ): {
        sprite: StaticSpriteSource
        transform: SpriteTransform
    } {
        const { sprite, position } = spriteCaches[this.spec.spriteId].get(angle)
        const transform = new SpriteTransform(
            // convert from "bottom center" to "top left" for the relative sprite
            new Point(
                this.dude.animation.sprite.dimensions.x / 2,
                this.dude.animation.sprite.dimensions.y
            )
                .plus(position)
                .plus(offset)
                .plus(this.dude.getOffsetRelativeToAnimation())
                .apply(Math.round),
            sprite.dimensions
        ).relativeTo(this.dude.animation.transform)
        return { sprite, transform }
    }
}
