import { Component } from "../../engine/component"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { TileManager } from "../graphics/TileManager"
import { StartData, UpdateData } from "../../engine/engine"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/point"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Dude } from "./Dude"
import { Animator } from "../../engine/util/Animator"
import { BoxCollider } from "../../engine/collision/BoxCollider"

enum State {
    SHEATHED,
    DRAWN,
    ATTACKING
}

export class Weapon extends Component {

    private readonly id: string
    private weaponSprite: TileComponent
    private state: State = State.DRAWN
    // private slashSprite: TileComponent
    private dude: Dude
    private shouldCheckHits: boolean

    constructor(id: string) {
        super()
        this.id = id
    }

    start(startData: StartData) {
        this.weaponSprite = this.entity.addComponent(
            new TileComponent(
                TileManager.instance.dungeonCharacters.getTileSource(this.id)
            )
        )

        // this.slashSprite = this.entity.addComponent(
        //     new TileComponent(
        //         TileManager.instance.oneBit.getTileSource("slash")
        //     )
        // )
        // this.slashSprite.enabled = false
    }

    update(updateData: UpdateData) {
        if (!!this.animator) {
            this.animator.update(updateData.elapsedTimeMillis)
        }

        if (this.state === State.ATTACKING && !!this.dude && this.shouldCheckHits) {
            this.shouldCheckHits = false
            const attackDistance = this.weaponSprite.transform.dimensions.y + 3  // add a tiny buffer for small weapons like the dagger to still work
            updateData.view.entities
                    .map(e => e.getComponent(Dude))
                    .filter(d => !!d && d !== this.dude)
                    .filter(d => this.weaponSprite.transform.mirrorX === (d.standingPosition.x < this.dude.standingPosition.x))
                    .filter(d => d.standingPosition.distanceTo(this.dude.standingPosition) < attackDistance)
                    .forEach(d => d.damage(d.standingPosition.minus(this.dude.standingPosition), 10))
        }
    }

    syncWithPlayerAnimation(character: Dude, characterAnim: AnimatedTileComponent) {
        this.dude = character

        if (!!this.weaponSprite) {
            const offsetFromEdge = new Point(6, 26).minus(this.weaponSprite.transform.dimensions)  // for DRAWN/SHEATHED

            // relative position for DRAWN state when characer is facing right (mirroring logic below)
            let pos = new Point(0, 0)
            let rotation = 0

            if (this.state === State.DRAWN) {
                pos = offsetFromEdge
            } else if (this.state === State.SHEATHED) {  // TODO add side sheath for swords
                // center on back
                pos = offsetFromEdge.plus(new Point(3, -1))
            } else if (this.state === State.ATTACKING) {
                const posWithRotation = this.getAttackAnimationPosition(characterAnim.transform.dimensions.y)
                pos = posWithRotation[0].plus(offsetFromEdge)
                rotation = posWithRotation[1]
            }

            this.weaponSprite.transform.rotation = rotation
            this.weaponSprite.transform.mirrorY = this.state == State.SHEATHED

            // magic based on the animations
            const f = characterAnim.currentFrame()
            if (!character.isMoving) {
                pos = pos.plus(new Point(0, f == 3 ? 1 : f))
            } else {
                pos = pos.plus(new Point(0, f == 0 ? -1 : -((3 - characterAnim.currentFrame()))))
            }

            // mirror weapon pos
            const charMirror = characterAnim.transform.mirrorX
            if (charMirror) {
                pos = new Point(characterAnim.transform.dimensions.x - pos.x - this.weaponSprite.transform.dimensions.x, pos.y)
            }

            // set position relative to the character
            this.weaponSprite.transform.position = characterAnim.transform.position.plus(pos)

            // show sword behind character if mirrored
            this.weaponSprite.transform.depth = characterAnim.transform.depth + 1 - (this.state == State.SHEATHED ? 2 : 0)
            this.weaponSprite.transform.mirrorX = charMirror





            // TODO maybe keep the slash stuff later
            // this.slashSprite.enabled = this.animator?.getCurrentFrame() === 3
            // this.slashSprite.transform.depth = characterAnim.transform.depth + 2
            // this.slashSprite.transform.mirrorX = charMirror
            // this.slashSprite.transform.position = characterAnim.transform.position.plus(
            //     new Point((charMirror ? -1 : 1) * (this.weaponSprite.transform.dimensions.y - 8), 8)
            // )
        }
    }

    toggleSheathed() {
        if (this.state === State.SHEATHED) {
            this.state = State.DRAWN
        } else if (this.state === State.DRAWN) {
            this.state = State.SHEATHED
        }
    }

    attack() {
        if (this.state === State.DRAWN) {
            setTimeout(() => this.shouldCheckHits = true, 150)
            this.playAttackAnimation()
        }
    }

    private animator: Animator
    private currentAnimationFrame: number = 0
    private currentAnimation: number = 0
    private playAttackAnimation() {
        this.state = State.ATTACKING
        this.animator = new Animator(
            Animator.frames(8, 40), 
            (index) => this.currentAnimationFrame = index, 
            () => {
                this.state = State.DRAWN  // reset to DRAWN when animation finishes
                this.animator = null
            }
        ) 
    }

    /**
     * Returns (position, rotation)
     */
    private getAttackAnimationPosition(charHeight: number): [Point, number] {
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