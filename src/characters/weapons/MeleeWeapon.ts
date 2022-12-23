import { Point, UpdateData } from "brigsby/dist"
import {
    ImageFilter,
    SpriteComponent,
    SpriteTransform,
    StaticSpriteSource,
} from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
import { BasicAttackAnimation } from "./animations/BasicAttackAnimation"
import { IdleAnimation } from "./animations/IdleAnimation"
import { MeleeAnimation } from "./animations/MeleeAnimation"
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

/**
 * TODO: Rewrite this to use dynamic sprite rotations so that we can create some fun variance in attacks + combo animations
 */
export class MeleeWeapon extends Weapon {
    private spec: WeaponSpec

    // private weaponSprite: StaticSpriteSource
    // private weaponTransform: SpriteTransform
    private state: State = State.DRAWN
    private slashSprite: SpriteComponent

    private idleAnim: MeleeAnimation
    private sheathedAnim: MeleeAnimation
    private attackAnim: MeleeAnimation

    constructor(spec: WeaponSpec) {
        super()
        this.spec = spec
        const { spriteId, offsetFromCenter } = spec

        this.start = () => {
            // this.weaponTransform = new SpriteTransform(
            //     Point.ZERO,
            //     this.weaponSprite.dimensions
            // ).relativeTo(this.dude.animation.transform)
            this.slashSprite = this.entity.addComponent(
                Tilesets.instance.oneBit.getTileSource("slash").toComponent()
            )

            spriteCaches[spriteId] =
                spriteCaches[spriteId] ??
                new WeaponSpriteCache(
                    Tilesets.instance.dungeonCharacters.getTileSource(spriteId),
                    HAND_POSITION_OFFSET.minus(offsetFromCenter)
                )

            this.idleAnim = new IdleAnimation(this.spec)
            this.sheathedAnim = new SheathedAnimation(this.spec)
            // this.attackAnim = new FullSpinAnimation(spriteCaches[spriteId])
        }
    }

    update({ elapsedTimeMillis }: UpdateData) {
        // if (!!this.animator) {
        //     this.animator.update(updateData.elapsedTimeMillis)
        // }
        this.getCurrentAnimation().update(elapsedTimeMillis)
    }

    // getWrappedRenderMethods(filter: ImageFilter) {
    //     return [this.weaponSprite.filtered(filter).toImageRender(this.weaponTransform)]
    // }

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
            // this.attackAnim = new FullSpinAnimation(this.spec, onFinish)
            this.attackAnim = new BasicAttackAnimation(this.spec, onFinish)
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

    /*private animate() {
        const offsetFromEdge = new Point(
            this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.spec.offsetFromCenter)

        let pos = new Point(0, 0)
        let rotation = 0

        if (this.state === State.DRAWN) {
            pos = offsetFromEdge
        } else if (this.state === State.SHEATHED) {
            // center on back
            pos = offsetFromEdge.plus(new Point(3, -1))
        } else if (this.state === State.ATTACKING) {
            const [newPos, newRotation] = this.getAttackAnimationPosition()
            pos = newPos.plus(offsetFromEdge)
            rotation = newRotation
        }

        this.weaponTransform.rotation = rotation
        this.weaponTransform.mirrorY = this.state == State.SHEATHED

        pos = pos.plus(this.dude.getOffsetRelativeToAnimation())

        this.weaponTransform.position = pos

        // show sword behind character if sheathed
        this.weaponTransform.depth = this.state == State.SHEATHED ? -0.5 : 0.5

        const frame = this.animator?.getCurrentFrame()
        this.slashSprite.enabled = frame === 3
        this.slashSprite.transform.depth = this.dude.animation.transform.depth + 2
        this.slashSprite.transform.mirrorX = this.weaponTransform.mirrorX
        this.slashSprite.transform.position = this.dude.animation.transform.position.plus(
            new Point(
                (this.weaponTransform.mirrorX ? -1 : 1) * (this.weaponTransform.dimensions.y - 10),
                8
            )
        )
    }*/

    getWrappedRenderMethods(filter: ImageFilter) {
        const { sprite, transform } = this.getCurrentAnimation().getFrame(
            this.dude,
            spriteCaches[this.spec.spriteId]
        )

        // transform.depth = this.state == State.SHEATHED ? -0.5 : 0.5

        return [sprite.filtered(filter).toImageRender(transform)]
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

    // private animator: Animator
    // private currentAnimationFrame: number = 0
    // private playAttackAnimation() {
    //     this.animator = new Animator(
    //         Animator.frames(8, 40),
    //         (index) => (this.currentAnimationFrame = index),
    //         () => {
    //             this.animator = null
    //             this.state = State.DRAWN // reset to DRAWN when animation finishes
    //         }
    //     )
    // }

    /**
     * Returns (position, rotation)
     */
    // private getAttackAnimationPosition(): Point {
    //     const swingStartFrame = 3
    //     const resettingFrame = 7

    //     if (this.currentAnimationFrame < swingStartFrame) {
    //         return new Point(this.currentAnimationFrame * 3, 0)
    //     } else if (this.currentAnimationFrame < resettingFrame) {
    //         return new Point(
    //             6 -
    //                 this.currentAnimationFrame +
    //                 this.weaponTransform.dimensions.y -
    //                 swingStartFrame * 3,
    //             Math.floor(this.weaponTransform.dimensions.y / 2 - 1)
    //         )
    //     } else {
    //         return new Point((1 - this.currentAnimationFrame + resettingFrame) * 3, 2)
    //     }
    // }
}
