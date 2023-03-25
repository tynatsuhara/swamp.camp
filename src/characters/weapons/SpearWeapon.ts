import { Point, UpdateData } from "brigsby/dist"
import { ImageFilter, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Tilesets } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { spawnThrownProjectile } from "./ThrownProjectile"
import { HAND_POSITION_OFFSET, Weapon } from "./Weapon"
import { WeaponSpriteCache } from "./WeaponSpriteCache"
import { WeaponType } from "./WeaponType"

enum State {
    SHEATHED,
    DRAWN,
    DRAWING,
    ATTACKING,
}

let spriteCache: WeaponSpriteCache

export class SpearWeapon extends Weapon {
    private offsetFromCenter: Point
    private state: State = State.DRAWN
    private _range: number

    private timeDrawn = 0

    constructor() {
        super()
        this.start = (startData) => {
            const baseSprite = Tilesets.instance.dungeonCharacters
                .getTileSource("weapon_spear")
                .rotated(90)
            this._range = baseSprite.dimensions.x

            this.offsetFromCenter = new Point(-12, -8)

            spriteCache =
                spriteCache ??
                new WeaponSpriteCache(baseSprite, HAND_POSITION_OFFSET.minus(this.offsetFromCenter))
        }
    }

    update(updateData: UpdateData) {
        if (this.state === State.DRAWING) {
            this.timeDrawn += updateData.elapsedTimeMillis
        }

        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }
    }

    private getSpriteAndTransform(
        angle: number,
        offset = Point.ZERO
    ): {
        sprite: StaticSpriteSource
        transform: SpriteTransform
    } {
        const { sprite, position } = spriteCache.get(angle)
        const transform = new SpriteTransform(
            // convert from "bottom center" to "top left" for the relative sprite
            new Point(
                this.dude.animation.sprite.dimensions.x / 2,
                this.dude.animation.sprite.dimensions.y
            )
                .plus(position)
                .plus(this.offsetFromCenter)
                .plus(offset)
                .plus(this.dude.getOffsetRelativeToAnimation())
                .apply(Math.round),
            sprite.dimensions
        ).relativeTo(this.dude.animation.transform)
        return { sprite, transform }
    }

    getWrappedRenderMethods(filter: ImageFilter) {
        let angle = this.getAimingAngle()
        let offset = Point.ZERO

        const drawSpeed = 100

        if (this.state === State.DRAWN) {
            // no-op
        } else if (this.state === State.SHEATHED) {
            offset = new Point(0, -2)
            angle = -90
        } else if (this.state === State.DRAWING) {
            const drawn = Math.floor(this.timeDrawn / -drawSpeed)
            offset = new Point(Math.max(drawn, -4), 0).rotatedAround(Point.ZERO, angle)
        } else if (this.state === State.ATTACKING) {
            offset = this.getAttackAnimationPosition().rotatedAround(Point.ZERO, angle)
        }

        const { sprite, transform } = this.getSpriteAndTransform(angle, offset)

        transform.depth = this.state == State.SHEATHED ? -0.5 : 0.5

        return [sprite.filtered(filter).toImageRender(transform)]
    }

    getType() {
        return WeaponType.SPEAR
    }

    isAttacking() {
        return this.state === State.DRAWING || this.state === State.ATTACKING
    }

    setSheathed(sheathed: boolean) {
        this.state = sheathed ? State.SHEATHED : State.DRAWN
    }

    isSheathed() {
        return this.state === State.SHEATHED
    }

    getRange() {
        return this._range
    }

    /**
     * @param newAttack
     */
    attack(newAttack: boolean) {
        if (this.dude.shield && !this.dude.shield?.canAttack()) {
            return
        }
        if (newAttack && this.state === State.DRAWN) {
            this.state = State.DRAWING
        }
    }

    cancelAttack() {
        if (this.state !== State.DRAWING) {
            return
        }

        const timeToThrow = 500
        if (this.timeDrawn > timeToThrow) {
            this.dude.inventory.removeItemAtIndex(
                this.dude.inventory.findIndex(
                    (stack) => stack?.item === Item.SPEAR && stack.metadata.equipped === "weapon"
                )
            )

            const { sprite, transform } = this.getSpriteAndTransform(this.getAimingAngle())

            const newTransform = new SpriteTransform(
                transform.position,
                transform.dimensions,
                transform.rotation,
                transform.mirrorX,
                transform.mirrorY,
                transform.depth
            )

            const tip = this.offsetFromCenter.plus(new Point(22, 2))
            const rotatedTip = tip.rotatedAround(HAND_POSITION_OFFSET, this.getAimingAngle())

            spawnThrownProjectile(
                sprite.toComponent(newTransform),
                this.dude.standingPosition.plus(
                    new Point(rotatedTip.x * this.dude.getFacingMultiplier(), rotatedTip.y)
                ),
                // Item.SPEAR,
                this.getAimingDirection().normalized().times(1.1),
                this.dude
            )
        } else {
            this.state = State.ATTACKING
            setTimeout(() => this.damageEnemies(), 100)
            this.playAttackAnimation()
        }

        this.timeDrawn = 0
    }

    private damageEnemies() {
        if (!this.enabled || session.isGuest()) {
            return
        }
        const attackDistance = this.getRange() + 4 // add a tiny buffer for small weapons like the dagger to still work
        const enemy = Weapon.getEnemiesInRange(this.dude, attackDistance)[0]
        enemy?.damage(1, {
            direction: enemy.standingPosition.minus(this.dude.standingPosition),
            knockback: 30,
            attacker: this.dude,
        })
    }

    private frameCount = 6
    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(this.frameCount, 40),
            (index) => (this.currentAnimationFrame = index),
            () => {
                this.animator = null
                // TODO: use delayBetweenAttacks to allow NPCs to use spears
                this.state = State.DRAWN // reset to DRAWN when animation finishes
            }
        )
    }

    private getAttackAnimationPosition(): Point {
        if (this.currentAnimationFrame >= this.frameCount - 1) {
            return new Point(2, 0)
        } else {
            const x = [8, 14, 16, 12, 8][this.currentAnimationFrame]
            return new Point(x, 0)
        }
    }
}
