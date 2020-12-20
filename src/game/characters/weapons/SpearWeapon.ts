import { Weapon } from "./Weapon"
import { WeaponType } from "./WeaponType"
import { StaticTileSource } from "../../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/point"
import { Tilesets } from "../../graphics/Tilesets"
import { UpdateData } from "../../../engine/engine"
import { Animator } from "../../../engine/util/Animator"

enum State {
    SHEATHED,
    DRAWN,
    DRAWING,
    ATTACKING
}

export class SpearWeapon extends Weapon {

    private weaponSprite: StaticTileSource
    private weaponTransform: TileTransform
    private offsetFromCenter: Point
    private state: State = State.DRAWN
    private _range: number
    private delayBetweenAttacks = 0  // delay after the animation ends before the weapon can attack again in millis

    private timeDrawn = 0;

    constructor() {
        super()
        this.start = (startData) => {
            this.weaponSprite = Tilesets.instance.dungeonCharacters.getTileSource("weapon_spear")
            this.weaponTransform = new TileTransform(Point.ZERO, this.weaponSprite.dimensions).relativeTo(this.dude.animation.transform)
            this.offsetFromCenter = new Point(-5, 0)
            this._range = this.weaponSprite.dimensions.y
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
        return [this.weaponSprite.toImageRender(this.weaponTransform)]
    }

    getType() {
        return WeaponType.SPEAR
    }

    setDelayBetweenAttacks(delayMs: number) {
        this.delayBetweenAttacks = delayMs
    }

    isAttacking() {
        return this.state === State.DRAWING || this.state === State.ATTACKING
    }

    toggleSheathed() {
        if (this.state === State.SHEATHED) {
            this.state = State.DRAWN
        } else if (this.state === State.DRAWN) {
            this.state = State.SHEATHED
        }
    }

    getRange() {
        return this._range
    }

    attack() {
        if (this.dude.shield && !this.dude.shield?.canAttack()) {
            return
        }
        if (this.state === State.DRAWN) {
            this.state = State.DRAWING
        }
    }

    cancelAttack() {
        if (this.state !== State.DRAWING) {
            return
        }

        const timeToThrow = 500
        if (this.timeDrawn > timeToThrow) {
            console.log("throw")
        } else {
            console.log("stab")
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
        const attackDistance = this.getRange() + 4  // add a tiny buffer for small weapons like the dagger to still work
        // TODO maybe only allow big weapons to hit multiple targets
        Weapon.getEnemiesInRange(this.dude, attackDistance).forEach(d => {
            d.damage(1, d.standingPosition.minus(this.dude.standingPosition), 30)
        })
    }

    private animate() {
        const offsetFromEdge = new Point(
            this.dude.animation.transform.dimensions.x/2 - this.weaponTransform.dimensions.x/2,
            this.dude.animation.transform.dimensions.y - this.weaponTransform.dimensions.y
        ).plus(this.offsetFromCenter)

        const drawSpeed = 100

        const rotatedOffset = new Point(10, 10)
        let pos = new Point(0, 0)
        let rotation = 0

        if (this.state === State.DRAWN) {
            pos = offsetFromEdge
            if (!this.dude.shield || this.dude.shield.canAttack()) {
                rotation = 90
            }
        } else if (this.state === State.SHEATHED) {
            // center on back
            pos = offsetFromEdge.plus(new Point(3, -2))
        } else if (this.state === State.DRAWING) {
            const drawn = Math.floor(this.timeDrawn/-drawSpeed)
            pos = offsetFromEdge.plusX(Math.max(drawn, -4))
            rotation = 90
        } else if (this.state === State.ATTACKING) {
            const posWithRotation = this.getAttackAnimationPosition()
            pos = posWithRotation[0].plus(offsetFromEdge)
            rotation = posWithRotation[1]
        }

        if (rotation === 90) {
            pos = pos.plus(rotatedOffset)
        }

        pos = pos.plus(this.dude.getAnimationOffsetPosition())
        
        this.weaponTransform.rotation = rotation
        this.weaponTransform.position = pos

        // show sword behind character if sheathed
        this.weaponTransform.depth = this.state == State.SHEATHED ? -.5 : .5
    }

    private frameCount = 6
    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(this.frameCount, 40), 
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.animator = null
                // TODO: use delayBetweenAttacks to allow NPCs to use spears
                this.state = State.DRAWN  // reset to DRAWN when animation finishes
            }
        ) 
    }

    /**
     * Returns (position, rotation)
     */
    private getAttackAnimationPosition(): [Point, number] {
        if (this.currentAnimationFrame >= this.frameCount - 1) {
            return [new Point(2, 0), 90]
        } else {
            const x = [8, 14, 16, 12, 8][this.currentAnimationFrame]
            return [new Point(x, 0), 90]
        }
    }
}
