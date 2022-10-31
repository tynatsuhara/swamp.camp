import { ButtonState, Component, debug, pt, UpdateData } from "brigsby/dist"
import { controls } from "../../Controls"
import { Camera } from "../../cutscenes/Camera"
import { PlaceElementDisplay } from "../../ui/PlaceElementDisplay"
import { UIStateManager } from "../../ui/UIStateManager"
import { here } from "../../world/locations/LocationManager"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"

export type SerializablePlayerControls = {
    isWalkUpHeld: boolean
    isWalkDownHeld: boolean
    isWalkLeftHeld: boolean
    isWalkRightHeld: boolean
    isJumpDown: boolean
    isRollDown: boolean
    isSheathKeyDown: boolean
    isBlockHeld: boolean
    playerFacingDirection: number
    isAttackHeld: boolean
    isAttackDown: boolean
    canProvideInput: boolean
}

export abstract class AbstractPlayer extends Component {
    private _dude: Dude
    get dude() {
        return this._dude
    }

    awake() {
        this._dude = this.entity.getComponent(Dude)
        this.dude.setOnDamageCallback((blocked) => {
            // TODO: Add controller vibration if possible
            if (!this.dude.isAlive) {
                Camera.instance.shake(6, 600)
            } else if (blocked) {
                Camera.instance.shake(2.5, 400)
            } else {
                Camera.instance.shake(3.5, 400)
            }
            controls.vibrate({
                duration: 300,
                strongMagnitude: 0.5,
                weakMagnitude: 0.5,
            })
        })
    }

    // MPTODO clean up?
    update(updateData: UpdateData): void {
        if (!this.dude.isAlive) {
            return
        }
    }

    getSerializablePlayerControls(): SerializablePlayerControls {
        // Controls we'll need to pass
        const canMove = !UIStateManager.instance.isMenuOpen || PlaceElementDisplay.instance.isOpen
        return {
            isWalkUpHeld: canMove ? controls.isWalkUpHeld() : false,
            isWalkDownHeld: canMove ? controls.isWalkDownHeld() : false,
            isWalkLeftHeld: canMove ? controls.isWalkLeftHeld() : false,
            isWalkRightHeld: canMove ? controls.isWalkRightHeld() : false,
            isJumpDown: controls.isJumpDown(),
            isRollDown: controls.isRollDown(),
            isSheathKeyDown: controls.isSheathKeyDown(),
            isBlockHeld: controls.isBlockHeld(),
            playerFacingDirection: controls.getPlayerFacingDirection(this.dude),
            isAttackHeld: controls.isAttack(ButtonState.HELD),
            isAttackDown: controls.isAttack(ButtonState.DOWN),
            canProvideInput: !UIStateManager.instance.isMenuOpen,
        }
    }

    doMovementOnHost(elapsedTimeMillis: number, playerControls: SerializablePlayerControls) {
        let dx = 0
        let dy = 0

        if (this.dude.rolling) {
            // TODO: change how momentum works if we implement slippery ice
            dx = this.dude.rollingMomentum.x
            dy = this.dude.rollingMomentum.y
        } else {
            if (playerControls.isWalkUpHeld) {
                dy--
            }
            if (playerControls.isWalkDownHeld) {
                dy++
            }
            if (playerControls.isWalkLeftHeld) {
                dx--
            }
            if (playerControls.isWalkRightHeld) {
                dx++
            }
        }

        const speedMultiplier =
            (dx !== 0 || dy !== 0 ? this.pushCheck() : 1) * debug.speedMultiplier

        const velocity = pt(dx, dy)

        this.dude.move(
            elapsedTimeMillis,
            velocity,
            this.dude.rolling ? 0 : playerControls.playerFacingDirection,
            speedMultiplier
        )

        if (!playerControls.canProvideInput) {
            return
        }

        // Check other user input

        if (!this.dude.jumping && playerControls.isJumpDown) {
            this.dude.jump()
        } else if (!this.dude.rolling && playerControls.isRollDown && (dx !== 0 || dy !== 0)) {
            this.dude.roll()
            this.dude.rollingMomentum = pt(dx, dy)
        }

        if (playerControls.isSheathKeyDown) {
            const sheathed = !this.dude.weapon?.isSheathed() ?? false
            this.dude.setWeaponAndShieldDrawn(!sheathed)
        }

        let blocking = false
        if (!!this.dude.shield) {
            blocking = playerControls.isBlockHeld
            this.dude.updateBlocking(blocking)
        }

        if (playerControls.isAttackHeld && !blocking) {
            const newAttack = playerControls.isAttackDown
            this.dude.weapon?.attack(newAttack)
        } else {
            this.dude.weapon?.cancelAttack()
        }
    }

    /**
     * @returns a speed multiplier
     */
    private pushCheck(): number {
        const minDistanceToBePushed = 10
        const dudesToPush = here()
            .getDudes()
            .filter(
                (d) =>
                    d !== this.dude &&
                    d.standingPosition.distanceTo(this.dude.standingPosition) <
                        minDistanceToBePushed
            )

        dudesToPush.forEach((d) =>
            d.knockback(d.standingPosition.minus(this.dude.standingPosition), 10)
        )

        const now = WorldTime.instance.time
        if (dudesToPush.length === 0 && this.pushingUntil < now) {
            return 1
        }

        if (dudesToPush.length > 0) {
            const pushingDuration = 100 // we need to cache this since they won't be colliding every frame
            this.pushingUntil = Math.max(this.pushingUntil, now + pushingDuration)
        }

        return 0.45
    }
    private pushingUntil = 0
}
