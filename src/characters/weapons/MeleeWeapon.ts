import { Point, UpdateData } from "brigsby/dist"
import {
    ImageFilter,
    SpriteComponent,
    SpriteTransform,
    StaticSpriteSource,
} from "brigsby/dist/sprites"
import { Animator } from "brigsby/dist/util"
import { Tilesets } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { DudeType } from "../DudeType"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING,
}

/**
 * TODO: Rewrite this to use dynamic sprite rotations so that we can create some fun variance in attacks + combo animations
 */
export class MeleeWeapon extends Weapon {
    private weaponType: WeaponType
    private weaponSprite: StaticSpriteSource
    private weaponTransform: SpriteTransform
    private offsetFromCenter: Point
    private state: State = State.DRAWN
    private slashSprite: SpriteComponent
    private _range: number

    constructor(weaponType: WeaponType, spriteId: string, offsetFromCenter: Point) {
        super()
        this.start = (startData) => {
            this.weaponSprite = Tilesets.instance.dungeonCharacters.getTileSource(spriteId)
            this.weaponTransform = new SpriteTransform(
                Point.ZERO,
                this.weaponSprite.dimensions
            ).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = offsetFromCenter
            this._range = this.weaponSprite.dimensions.y
            this.slashSprite = this.entity.addComponent(
                Tilesets.instance.oneBit.getTileSource("slash").toComponent()
            )
        }
        this.weaponType = weaponType
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }

    getWrappedRenderMethods(filter: ImageFilter) {
        return this.weaponSprite
            ? [this.weaponSprite.filtered(filter).toImageRender(this.weaponTransform)]
            : []
    }

    getType() {
        return this.weaponType
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
        return this._range
    }

    attack(newAttack: boolean) {
        if (this.dude.shield && !this.dude.shield?.canAttack()) {
            return
        }
        if (newAttack && this.state === State.DRAWN) {
            this.state = State.ATTACKING
            setTimeout(() => this.damageEnemies(), 100)
            this.playAttackAnimation()
        }
    }

    private damageEnemies() {
        if (!this.enabled) {
            return
        }

        const attackDistance = this.getRange() + 4 // add a tiny buffer for small weapons like the dagger to still work

        // TODO maybe only allow big weapons to hit multiple targets
        const enemies = Weapon.getEnemiesInRange(this.dude, attackDistance)

        if (session.isHost()) {
            enemies.forEach((d) => {
                d.damage(1, {
                    direction: d.standingPosition.minus(this.dude.standingPosition),
                    knockback: 30,
                    attacker: this.dude,
                })
            })
        }

        if (this.dude.type === DudeType.PLAYER && enemies.length === 0) {
            Weapon.hitResources(this.dude)
        }
    }

    private animate() {
        const offsetFromEdge = new Point(
            this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)

        let pos = new Point(0, 0)
        let rotation = 0

        if (this.state === State.DRAWN) {
            pos = offsetFromEdge
        } else if (this.state === State.SHEATHED) {
            // TODO add side sheath for swords
            // center on back
            pos = offsetFromEdge.plus(new Point(3, -1))
        } else if (this.state === State.ATTACKING) {
            const posWithRotation = this.getAttackAnimationPosition()
            pos = posWithRotation[0].plus(offsetFromEdge)
            rotation = posWithRotation[1]
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
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(8, 40),
            (index) => (this.currentAnimationFrame = index),
            () => {
                this.animator = null
                this.state = State.DRAWN // reset to DRAWN when animation finishes
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
                    6 -
                        this.currentAnimationFrame +
                        this.weaponTransform.dimensions.y -
                        swingStartFrame * 3,
                    Math.floor(this.weaponTransform.dimensions.y / 2 - 1)
                ),
                90,
            ]
        } else {
            return [new Point((1 - this.currentAnimationFrame + resettingFrame) * 3, 2), 0]
        }
    }
}
