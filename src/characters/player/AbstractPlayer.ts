import { ButtonState, Component, debug, pt, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util/Lists"
import { controls } from "../../Controls"
import { Camera } from "../../cutscenes/Camera"
import { ITEM_METADATA_MAP } from "../../items/Items"
import { PlaceElementDisplay } from "../../ui/PlaceElementDisplay"
import { UIStateManager } from "../../ui/UIStateManager"
import { Interactable } from "../../world/elements/Interactable"
import { here } from "../../world/locations/LocationManager"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { player } from "./index"

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
        if (this.dude === player()) {
            this.dude.setOnDamageCallback((blocked) => {
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
            this.dude.updateAttacking(newAttack)
        } else {
            this.dude.cancelAttacking()
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

    checkHotKeys(updateData: UpdateData) {
        controls.HOT_KEY_OPTIONS.forEach((hotKey) => {
            if (updateData.input.isKeyDown(hotKey)) {
                const hotKeyItem = this.dude.inventory
                    .getStacks()
                    .find((s) => s.metadata.hotKey === hotKey)?.item
                if (hotKeyItem) {
                    const itemData = ITEM_METADATA_MAP[hotKeyItem]
                    if (itemData.equippableWeapon && !this.dude.weapon?.isAttacking()) {
                        this.dude.setWeapon(itemData.equippableWeapon)
                    } else if (itemData.equippableShield && !this.dude.shield?.isBlocking()) {
                        this.dude.setShield(itemData.equippableShield)
                    }
                }
            }
        })
    }

    updateInteractables(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(pt(0, 7))
        const interactables = updateData.view.entities
            .map((e) => e.getComponent(Interactable))
            .filter((e) => e?.enabled)
        interactables.forEach((i) => i.updateIndicator(false))

        const possibilities = interactables
            .filter((e) => this.dude.isFacing(e.position)) // interactables the dude is facing
            .filter((e) => e.position.distanceTo(interactCenter) < interactDistance)
            .filter((e) => e.isInteractable())

        const i = Lists.minBy(possibilities, (e) => e.position.distanceTo(interactCenter))
        if (!!i) {
            i.updateIndicator(true)
        }
        return i
    }
}
