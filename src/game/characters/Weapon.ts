import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets } from "../graphics/Tilesets"
import { UpdateData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { Dude } from "./Dude"
import { Animator } from "../../engine/util/Animator"
import { LocationManager } from "../world/LocationManager"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING
}

/**
 * A weapon being wielded by a dude
 */
export class Weapon extends Component {

    private weaponSprite: TileComponent
    private state: State = State.DRAWN
    // private slashSprite: TileComponent
    private dude: Dude
    private _range: number
    get range() { return this._range }
    public delay = 0  // delay after the animation ends before the weapon can attack again in millis

    constructor(weaponId: string) {
        super()
        this.start = (startData) => {
            this.dude = this.entity.getComponent(Dude)
            this.weaponSprite = this.entity.addComponent(
                new TileComponent(
                    Tilesets.instance.dungeonCharacters.getTileSource(weaponId),
                    new TileTransform().relativeTo(this.dude.animation.transform)
                )
            )
            this._range = this.weaponSprite.transform.dimensions.y
        }
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        this.animate()
    }

    // TODO find a better place for this?
    static damageInFrontOfDude(dude: Dude, attackDistance: number) {
        Array.from(LocationManager.instance.currentLocation.dudes)
                .filter(d => !!d && d !== dude)
                .filter(d => dude.isFacing(d.standingPosition))
                .filter(d => d.standingPosition.distanceTo(dude.standingPosition) < attackDistance)
                .forEach(d => d.damage(1, d.standingPosition.minus(dude.standingPosition), 30))
    }

    animate() {
        const offsetFromEdge = this.dude.animation.transform.dimensions
                .minus(new Point(9, 2))
                .minus(this.weaponSprite.transform.dimensions)

        let pos = new Point(0, 0)
        let rotation = 0

        if (this.state === State.DRAWN) {
            pos = offsetFromEdge
        } else if (this.state === State.SHEATHED) {  // TODO add side sheath for swords
            // center on back
            pos = offsetFromEdge.plus(new Point(3, -1))
        } else if (this.state === State.ATTACKING) {
            const posWithRotation = this.getAttackAnimationPosition()
            pos = posWithRotation[0].plus(offsetFromEdge)
            rotation = posWithRotation[1]
        }

        this.weaponSprite.transform.rotation = rotation
        this.weaponSprite.transform.mirrorY = this.state == State.SHEATHED

        pos = pos.plus(this.dude.getAnimationOffsetPosition())

        this.weaponSprite.transform.position = pos

        // show sword behind character if sheathed
        this.weaponSprite.transform.depth = this.state == State.SHEATHED ? -.5 : .5
        // this.weaponSprite.transform.mirrorX = charMirror

        // TODO maybe keep the slash stuff later
        // this.slashSprite.enabled = this.animator?.getCurrentFrame() === 3
        // this.slashSprite.transform.depth = characterAnim.transform.depth + 2
        // this.slashSprite.transform.mirrorX = charMirror
        // this.slashSprite.transform.position = characterAnim.transform.position.plus(
        //     new Point((charMirror ? -1 : 1) * (this.weaponSprite.transform.dimensions.y - 8), 8)
        // )
    }

    isDrawn() {
        return this.state !== State.SHEATHED
    }

    isAttacking() {
        return this.state === State.ATTACKING
    }

    toggleSheathed() {
        if (this.state === State.SHEATHED) {
            this.state = State.DRAWN
        } else if (this.state === State.DRAWN) {
            this.state = State.SHEATHED
        }
    }

    attack() {
        if (this.dude.shield?.isBlocking()) {
            return
        }
        if (this.state === State.DRAWN) {
            this.state = State.ATTACKING
            setTimeout(() => {
                if (!this.enabled) {
                    return
                }
                const attackDistance = this.range + 4  // add a tiny buffer for small weapons like the dagger to still work
                Weapon.damageInFrontOfDude(this.dude, attackDistance)
            }, 100)
            this.playAttackAnimation()
        }
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    private playAttackAnimation() {
        this.animator = new Animator(
            Animator.frames(8, 40), 
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.animator = null
                setTimeout(() => {
                    console.log(`delayed ${this.delay} ms`)
                    this.state = State.DRAWN  // reset to DRAWN when animation finishes
                }, this.delay)
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
                    (6-this.currentAnimationFrame) + this.weaponSprite.transform.dimensions.y - swingStartFrame*3, 
                    Math.floor(this.weaponSprite.transform.dimensions.y/2 - 1)
                ),
                90
            ]
        } else {
            return [new Point((1-this.currentAnimationFrame+resettingFrame) * 3, 2), 0]
        }
    }
}