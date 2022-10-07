import { Point, UpdateData } from "brigsby/dist"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Tilesets } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { spawnProjectile } from "./Projectile"
import { HAND_POSITION_OFFSET, Weapon, WEAPON_ROTATION_INCREMENT } from "./Weapon"
import { WeaponType } from "./WeaponType"

enum State {
    SHEATHED,
    DRAWN,
    DRAWING,
    ATTACKING,
}

type SpriteCache = Record<number, { sprite: StaticSpriteSource; position: Point }>

let spriteCache: SpriteCache

/**
 * @param baseSprite the sprite at 0 degrees rotation
 * @param baseSpritePosition the position of a sprite at 0 degrees
 * @param rotationPoint the point to rotate the sprite around
 */
const initSpriteCache = (
    baseSprite: StaticSpriteSource,
    baseSpritePosition: Point,
    rotationPoint: Point
) => {
    const cache: SpriteCache = {}
    const ogCenter = baseSpritePosition.plus(baseSprite.dimensions.floorDiv(2))

    for (let i = -90; i <= 90; i += WEAPON_ROTATION_INCREMENT) {
        if (i === 0) {
            cache[i] = {
                sprite: baseSprite,
                position: baseSpritePosition,
            }
        } else {
            const rotatedSprite = baseSprite.rotated(i)
            const centerAfterRotation = ogCenter.rotatedAround(rotationPoint, i)
            cache[i] = {
                sprite: rotatedSprite,
                position: centerAfterRotation.minus(rotatedSprite.dimensions.floorDiv(2)),
            }
        }
    }

    return cache
}

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
                initSpriteCache(baseSprite, this.offsetFromCenter, HAND_POSITION_OFFSET)
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
        const { sprite, position } = spriteCache[angle]
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

    getRenderMethods() {
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

        return [sprite?.toImageRender(transform)]
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
            this.dude.inventory.removeItem(Item.SPEAR, 1)
            this.dude.setWeapon(WeaponType.UNARMED)

            const { sprite, transform } = this.getSpriteAndTransform(this.getAimingAngle())

            const newTransform = new SpriteTransform(
                transform.position,
                transform.dimensions,
                transform.rotation,
                transform.mirrorX,
                transform.mirrorY,
                transform.depth
            )

            const tip = this.offsetFromCenter.plus(new Point(26, 2))
            const rotatedTip = tip.rotatedAround(HAND_POSITION_OFFSET, this.getAimingAngle())

            spawnProjectile(
                sprite.toComponent(newTransform),
                this.dude.standingPosition.plus(
                    new Point(rotatedTip.x * this.dude.getFacingMultiplier(), rotatedTip.y)
                ),
                Item.SPEAR,
                this.getAimingDirection().normalized().times(40),
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
        if (!this.enabled) {
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
