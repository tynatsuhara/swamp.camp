import { Point, UpdateData } from "brigsby/dist"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Tilesets } from "../../graphics/Tilesets"
import { showBoundingBox } from "../../Utils"
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
    // private weaponSprite: StaticSpriteSource
    // private weaponTransform: SpriteTransform
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

            this.offsetFromCenter = new Point(-12, -9)

            spriteCache =
                spriteCache ??
                initSpriteCache(
                    baseSprite,
                    this.offsetFromCenter,
                    HAND_POSITION_OFFSET
                    // new Point(
                    //     -(this.offsetFromCenter.x - HAND_POSITION_OFFSET.x),
                    //     -(this.offsetFromCenter.y - HAND_POSITION_OFFSET.y)
                    // )
                )
            // Array.from(
            //     { length: 180 / WEAPON_ROTATION_INCREMENT + 1 },
            //     (v, k) => k * WEAPON_ROTATION_INCREMENT - 90
            // ).reduce((obj, rotation) => {
            //     obj[rotation] = {
            //         sprite: Tilesets.instance.dungeonCharacters
            //             .getTileSource("weapon_spear")
            //             .rotated(rotation + 90),
            //         offset: Point.ZERO, // TODO figure out how to rotate around the hand position
            //     }
            //     return obj
            // }, {})
            // this.weaponTransform = new SpriteTransform(
            //     Point.ZERO,
            //     this.weaponSprite.dimensions
            // ).relativeTo(this.dude.animation.transform)
        }
    }

    update(updateData: UpdateData) {
        if (this.state === State.DRAWING) {
            this.timeDrawn += updateData.elapsedTimeMillis
        }

        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }

    getRenderMethods() {
        const { sprite, position } = spriteCache[this.getCursorRotation()]
        // TODO use offset
        const spriteRender = sprite?.toImageRender(
            new SpriteTransform(
                // this.offsetFromCenter
                // .plus(offset)
                new Point(
                    this.dude.animation.sprite.dimensions.x / 2,
                    this.dude.animation.sprite.dimensions.y
                )
                    .plus(position)
                    // .minus(sprite.dimensions.div(2).apply(Math.floor))
                    // .plusY(22 - sprite.dimensions.y / 2)
                    .plus(this.dude.getAnimationOffset())
                    .apply(Math.floor),
                sprite.dimensions
            ).relativeTo(this.dude.animation.transform)
        )

        return [spriteRender, ...showBoundingBox(spriteRender)]
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

        // TODO throwing
        // const timeToThrow = 500
        // if (this.timeDrawn > timeToThrow) {
        //     this.dude.inventory.removeItem(Item.SPEAR, 1)
        //     this.dude.setWeapon(WeaponType.UNARMED)

        //     const newTransform = new SpriteTransform(
        //         this.weaponTransform.position,
        //         this.weaponTransform.dimensions,
        //         this.weaponTransform.rotation,
        //         this.weaponTransform.mirrorX,
        //         this.weaponTransform.mirrorY,
        //         this.weaponTransform.depth
        //     )

        //     spawnProjectile(
        //         newTransform.position.plusY(24),
        //         this.weaponSprite,
        //         Item.SPEAR,
        //         new Point(40 * this.dude.getFacingMultiplier(), 4.5),
        //         this.dude
        //     )
        // } else {
        //     this.state = State.ATTACKING
        //     setTimeout(() => this.damageEnemies(), 100)
        //     this.playAttackAnimation()
        // }

        this.timeDrawn = 0
    }

    private damageEnemies() {
        if (!this.enabled) {
            return
        }
        const attackDistance = this.getRange() + 4 // add a tiny buffer for small weapons like the dagger to still work
        // TODO maybe only allow big weapons to hit multiple targets
        Weapon.getEnemiesInRange(this.dude, attackDistance).forEach((d) => {
            d.damage(1, {
                direction: d.standingPosition.minus(this.dude.standingPosition),
                knockback: 30,
                attacker: this.dude,
            })
        })
    }

    // private getBasePosition(rotation) {
    //     let offset = new Point(
    //         this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2,
    //         this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
    //     ).plus(this.offsetFromCenter)

    //     if (rotation === 90) {
    //         offset = offset.plus(new Point(10, 10))
    //     }

    //     return offset.plus(this.dude.getOffsetRelativeToAnimation())
    // }

    private animate() {
        const drawSpeed = 100

        let pos = Point.ZERO
        let rotation = 0

        if (this.state === State.DRAWN) {
            if (!this.dude.shield || this.dude.shield.canAttack()) {
                // rotation = this.getSpearCursorRotation()
            }
        } else if (this.state === State.SHEATHED) {
            // center on back
            pos = new Point(3, -2)
        } else if (this.state === State.DRAWING) {
            const drawn = Math.floor(this.timeDrawn / -drawSpeed)
            pos = new Point(Math.max(drawn, -4), 0)
            // rotation = this.getSpearCursorRotation()
        } else if (this.state === State.ATTACKING) {
            pos = this.getAttackAnimationPosition()
            // rotation = this.getSpearCursorRotation()
        }

        // pos = pos.plus(this.getBasePosition(rotation))

        // this.weaponTransform.rotation = rotation
        // this.weaponTransform.position = pos

        // // show sword behind character if sheathed
        // this.weaponTransform.depth = this.state == State.SHEATHED ? -0.5 : 0.5
        // this.weaponTransform.mirrorY = rotation === 90
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
