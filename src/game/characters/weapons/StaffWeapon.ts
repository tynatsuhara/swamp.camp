import { UpdateData } from "../../../engine/Engine"
import { Point } from "../../../engine/Point"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Animator } from "../../../engine/util/Animator"
import { Lists } from "../../../engine/util/Lists"
import { Camera } from "../../cutscenes/Camera"
import { ImageFilters } from "../../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { LocationManager } from "../../world/LocationManager"
import { Player } from "../Player"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

/**
 * AOE weapon
 */
export class StaffWeapon extends Weapon {

    private weaponSprite: StaticTileSource
    private weaponTransform: TileTransform
    private offsetFromCenter: Point

    private targetSprite: StaticTileSource
    private targetSprite1: StaticTileSource
    private targetSprite2: StaticTileSource
    private targetAnimator: Animator

    private attackPosition: Point
    private explosion: AnimatedTileComponent

    private static readonly TARGET_ANIMATION_SPEED = 80
    
    constructor() {
        super()
        this.start = (startData) => {
            this.weaponSprite = Tilesets.instance.dungeonCharacters.getTileSource("weapon_red_magic_staff")
            this.weaponTransform = new TileTransform(Point.ZERO, this.weaponSprite.dimensions).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = new Point(-5, 0)
            this.targetSprite1 = Tilesets.instance.oneBit.getTileSource("aoe_target").filtered(ImageFilters.tint(Color.SUPER_ORANGE))
            this.targetSprite2 = Tilesets.instance.oneBit.getTileSource("aoe_target").filtered(ImageFilters.tint(Color.WHITE))
            this.targetAnimator = new Animator([StaffWeapon.TARGET_ANIMATION_SPEED, StaffWeapon.TARGET_ANIMATION_SPEED], i => {
                this.targetSprite = i % 2 === 0 ? this.targetSprite1 : this.targetSprite2
            })
        }
    }

    update(updateData: UpdateData) {
        const offset = new Point(
            this.dude.animation.transform.dimensions.x/2 - this.weaponTransform.dimensions.x/2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)

        this.animator?.update(updateData.elapsedTimeMillis)
        this.targetAnimator.update(updateData.elapsedTimeMillis)
        
        this.weaponTransform.position = offset
                .plus(this.dude.getAnimationOffsetPosition())
                .plus(StaffWeapon.STAFF_ANIMATION[this.currentAnimationFrame])
    }

    getType(): WeaponType {
        return WeaponType.STAFF_1
    }

    isAttacking() {
        throw new Error("isAttacking not implemented.")
    }

    toggleSheathed() {
        throw new Error("toggleSheathed not implemented.")
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
        if (newAttack) {
            this.playAttackAnimation()
            setTimeout(() => this.doAttack(), 750);
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
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.animator = null
                this.currentAnimationFrame = 0
                this.attackPosition = this.guessAttackPos()
            }
        )
    }

    private doAttack() {
        if (!this.attackPosition) {
            return
        }
        this.entity.addComponent(
            Tilesets.instance.explosions.getMeteorAnimation(this.attackPosition, () => {
                const attackDistance = TILE_SIZE * 1.5

                Array.from(LocationManager.instance.currentLocation.dudes)
                        .filter(d => !!d && d !== this.dude && d.isEnemy(this.dude))
                        .filter(d => d.standingPosition.distanceTo(this.attackPosition) < attackDistance)
                        .forEach(d => d.damage(2, d.position.minus(this.attackPosition), 50))

                Camera.instance.shake(5, 500)

                this.entity.addComponent(
                    Tilesets.instance.explosions.getExplosionAnimation(this.attackPosition)
                )

                this.attackPosition = null
            })
        )

    }

    private guessAttackPos() {
        // TODO: target other villagers?
        if (!Player.instance.dude.isAlive) {
            return
        }
        return Player.instance.dude.standingPosition.plus(Player.instance.velocity.times(60))
    }

    getRenderMethods() {
        return [
            this.weaponSprite.toImageRender(this.weaponTransform),
            !this.attackPosition 
                ? null 
                : this.targetSprite.toImageRender(TileTransform.new({ 
                    position: this.attackPosition.plus(new Point(1, 1).times(-TILE_SIZE/2)), 
                    depth: Number.MIN_SAFE_INTEGER + 50
                }))
        ]
    }
}