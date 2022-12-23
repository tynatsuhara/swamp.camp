import { Point, UpdateData } from "brigsby/dist"
import { ImageFilter, SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Animator, Lists } from "brigsby/dist/util"
import { Camera } from "../../cutscenes/Camera"
import { ImageFilters } from "../../graphics/ImageFilters"
import { Particles } from "../../graphics/particles/Particles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { session } from "../../online/session"
import { Color } from "../../ui/Color"
import { GroundRenderer } from "../../world/GroundRenderer"
import { here } from "../../world/locations/LocationManager"
import { player } from "../player"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

/**
 * AOE weapon
 */
export class StaffWeapon extends Weapon {
    private weaponSprite: StaticSpriteSource
    private weaponTransform: SpriteTransform
    private offsetFromCenter: Point

    private targetSprite: StaticSpriteSource
    private targetSprite1: StaticSpriteSource
    private targetSprite2: StaticSpriteSource
    private targetAnimator: Animator

    // if non-null, a target will be shown here
    private attackPosition: Point

    private static readonly TARGET_ANIMATION_SPEED = 80

    constructor() {
        super()
        this.start = () => {
            this.weaponSprite =
                Tilesets.instance.dungeonCharacters.getTileSource("weapon_red_magic_staff")
            this.weaponTransform = new SpriteTransform(
                Point.ZERO,
                this.weaponSprite.dimensions
            ).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = new Point(-5, 0)
            this.targetSprite1 = Tilesets.instance.oneBit
                .getTileSource("aoe_target")
                .filtered(ImageFilters.tint(Color.RED_4))
            this.targetSprite2 = Tilesets.instance.oneBit
                .getTileSource("aoe_target")
                .filtered(ImageFilters.tint(Color.WHITE))
            this.targetAnimator = new Animator(
                [StaffWeapon.TARGET_ANIMATION_SPEED, StaffWeapon.TARGET_ANIMATION_SPEED],
                (i) => {
                    this.targetSprite = i % 2 === 0 ? this.targetSprite1 : this.targetSprite2
                }
            )
        }
    }

    update(updateData: UpdateData) {
        const offset = new Point(
            this.dude.animation.transform.dimensions.x / 2 - this.weaponTransform.dimensions.x / 2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)

        this.animator?.update(updateData.elapsedTimeMillis)
        this.targetAnimator.update(updateData.elapsedTimeMillis)

        this.weaponTransform.position = offset
            .plus(this.dude.getOffsetRelativeToAnimation())
            .plus(StaffWeapon.STAFF_ANIMATION[this.currentAnimationFrame])
    }

    getType(): WeaponType {
        return WeaponType.STAFF_1
    }

    isAttacking() {
        return !!this.animator || !!this.attackPosition
    }

    setSheathed(sheathed: boolean) {
        /* no-op */
    }

    isSheathed(): boolean {
        /* no-op */
        return false
    }

    getRange(): number {
        return TILE_SIZE * 10
    }

    getStoppingDistance() {
        return TILE_SIZE * 8
    }

    getMillisBetweenAttacks() {
        return 2000 + Math.random() * 1000
    }

    attack(newAttack: boolean) {
        if (newAttack && !this.isAttacking()) {
            this.playAttackAnimation()
        }
    }

    private static STAFF_ANIMATION = Lists.repeat(2, [
        new Point(0, 0),
        new Point(-1, -1),
        new Point(-1, -2),
        new Point(0, -3),
        new Point(1, -2),
        new Point(1, -1),
    ])
    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(StaffWeapon.STAFF_ANIMATION.length, 40),
            (index) => {
                this.currentAnimationFrame = index

                // magic-y particles
                Particles.instance.emitParticle(
                    Math.random() > 0.5 ? Color.RED_4 : Color.RED_3,
                    this.dude.standingPosition.plusY(-26).randomlyShifted(6),
                    this.dude.standingPosition.y,
                    500,
                    (t) => new Point(0, t * -0.03),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            },
            () => {
                this.animator = null
                this.currentAnimationFrame = 0
                this.attackPosition = this.guessAttackPos()
                if (this.attackPosition) {
                    this.doAttack()
                }
            }
        )
    }

    private doAttack() {
        this.entity.addComponent(
            Tilesets.instance.explosions.getMeteorAnimation(
                this.attackPosition,
                70 * TILE_SIZE,
                () => {
                    const attackDistance = TILE_SIZE * 1.5

                    // everyone can get damaged by explosions, friend or foe
                    if (session.isHost()) {
                        here()
                            .getDudes()
                            .filter((d) => !!d)
                            .filter(
                                (d) =>
                                    d.standingPosition.distanceTo(this.attackPosition) <
                                    attackDistance
                            )
                            .forEach((d) => {
                                // knockback but don't damage allies
                                const damageVal = this.dude.isEnemy(d) ? 2 : 0
                                // don't track lastAttacker because it can cause friendly fire and get weird
                                d.damage(damageVal, {
                                    direction: d.standingPosition.minus(this.attackPosition),
                                    knockback: 50,
                                })
                            })
                    }

                    Camera.instance.shake(5, 500)

                    this.entity.addComponent(
                        Tilesets.instance.explosions.getExplosionAnimation(this.attackPosition)
                    )

                    this.explosionParticleEffects()

                    this.attackPosition = null
                }
            )
        )
    }

    private guessAttackPos() {
        // TODO: target other villagers?
        if (!player().isAlive) {
            return
        }
        return player().standingPosition.plus(player().velocity.times(60))
    }

    private explosionParticleEffects() {
        // smoke
        for (let i = 0; i < 50; i++) {
            const speed = Math.random() > 0.5 ? -0.01 : -0.007
            Particles.instance.emitParticle(
                Lists.oneOf([Color.TAUPE_2, Color.TAUPE_1, Color.BLACK, Color.BLACK]),
                this.attackPosition.randomCircularShift(12).plusY(-4),
                this.attackPosition.y,
                500 + Math.random() * 1500,
                (t) => new Point(0, t * speed),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // impact crater
        for (let i = 0; i < 25; i++) {
            Particles.instance.emitParticle(
                Math.random() > 0.7 ? Color.TAUPE_2 : Color.TAUPE_1,
                this.attackPosition.randomCircularShift(6),
                GroundRenderer.DEPTH + 1,
                10_000 + Math.random() * 5_000,
                (t) => Point.ZERO,
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }

        // flying debris
        for (let i = 0; i < 25; i++) {
            const random = Point.ZERO.randomCircularShift(1)
            const x = random.x
            const y = -Math.abs(random.y)
            Particles.instance.emitParticle(
                Math.random() > 0.5 ? Color.TAUPE_2 : Color.TAUPE_3,
                this.attackPosition.plus(random.times(10)),
                this.attackPosition.y,
                100 + Math.random() * 250,
                (t) => new Point(x, y).times(t * 0.35),
                Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
            )
        }
    }

    getWrappedRenderMethods(filter: ImageFilter) {
        return [
            this.weaponSprite.filtered(filter).toImageRender(this.weaponTransform),
            !this.attackPosition
                ? null
                : this.targetSprite.toImageRender(
                      SpriteTransform.new({
                          position: this.attackPosition.plus(new Point(1, 1).times(-TILE_SIZE / 2)),
                          depth: Number.MIN_SAFE_INTEGER + 50,
                      })
                  ),
        ]
    }
}
