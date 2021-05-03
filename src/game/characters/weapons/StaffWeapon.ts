import { UpdateData } from "../../../engine/Engine"
import { Point } from "../../../engine/Point"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Camera } from "../../cutscenes/Camera"
import { ExplosionSize } from "../../graphics/ExplosionTileset"
import { ImageFilters } from "../../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { LocationManager } from "../../world/LocationManager"
import { Player } from "../Player"
import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"

export class StaffWeapon extends Weapon {

    private weaponSprite: StaticTileSource
    private weaponTransform: TileTransform
    private offsetFromCenter: Point
    private targetSprite: StaticTileSource
    private attackPosition: Point
    private explosion: AnimatedTileComponent
    
    constructor() {
        super()
        this.start = (startData) => {
            this.weaponSprite = Tilesets.instance.dungeonCharacters.getTileSource("weapon_red_magic_staff")
            this.weaponTransform = new TileTransform(Point.ZERO, this.weaponSprite.dimensions).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = new Point(-5, 0)
            this.targetSprite = Tilesets.instance.oneBit.getTileSource("aoe_target").filtered(ImageFilters.tint(Color.SUPER_ORANGE))
        }
    }

    update(updateData: UpdateData) {
        const offset = new Point(
            this.dude.animation.transform.dimensions.x/2 - this.weaponTransform.dimensions.x/2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)
        
        this.weaponTransform.position = offset.plus(this.dude.getAnimationOffsetPosition())
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
            this.attackPosition = this.guessAttackPos()
            setTimeout(() => {
                this.doAttack()
            }, 750);
        }
    }

    private doAttack() {
        // TODO: add animation

        const attackDistance = TILE_SIZE * 1.5

        Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => !!d && d !== this.dude && d.isEnemy(this.dude))
                .filter(d => d.standingPosition.distanceTo(this.attackPosition) < attackDistance)
                .forEach(d => d.damage(2, d.position.minus(this.attackPosition), 50))

        const clearExplosion = () => {
            this.explosion?.delete()
        }

        Camera.instance.shake(5, 500)

        this.explosion = this.entity.addComponent(
            Tilesets.instance.explosions.getAnimation(ExplosionSize.MEDIUM_2, clearExplosion)
                    .toComponent(TileTransform.new({ 
                        position: this.attackPosition.plus(new Point(ExplosionSize.MEDIUM_2, ExplosionSize.MEDIUM_2).div(-2)), 
                        depth: Number.MAX_SAFE_INTEGER
                    }))
        )

        this.attackPosition = null
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