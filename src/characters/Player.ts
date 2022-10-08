import { ButtonState, Component, debug, Point, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { ITEM_METADATA_MAP } from "../items/Items"
import { PlaceElementDisplay } from "../ui/PlaceElementDisplay"
import { TextAlign } from "../ui/Text"
import { UIStateManager } from "../ui/UIStateManager"
import { Interactable } from "../world/elements/Interactable"
import { CampLocationGenerator } from "../world/locations/CampLocationGenerator"
import { camp, here, LocationManager } from "../world/locations/LocationManager"
import { WorldTime } from "../world/WorldTime"
import { Condition } from "./Condition"
import { Dude } from "./Dude"
import { DudeSpawner } from "./DudeSpawner"

export class Player extends Component {
    static instance: Player

    private rollingMomentum: Point
    private _velocity: Point = Point.ZERO
    get velocity() {
        return this._velocity
    }
    private _dude: Dude
    get dude() {
        return this._dude
    }

    private offMapWarningShown = false
    private timeOffMap = 0

    constructor() {
        super()
        Player.instance = this
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

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        this.checkIsOffMap(updateData)

        // TODO: Move to the same code as other conditional effects
        if (this.dude.hasCondition(Condition.HEALING)) {
            this.dude.heal(updateData.elapsedTimeMillis / 3500)
        }
        const possibleInteractable = this.updateInteractables(updateData)

        // Determine player movement

        let dx = 0
        let dy = 0

        if (this.dude.rolling) {
            // TODO: change how momentum works if we implement slippery ice
            dx = this.rollingMomentum.x
            dy = this.rollingMomentum.y
        } else if (!UIStateManager.instance.isMenuOpen || PlaceElementDisplay.instance.isOpen) {
            if (controls.isWalkUpHeld()) {
                dy--
            }
            if (controls.isWalkDownHeld()) {
                dy++
            }
            if (controls.isWalkLeftHeld()) {
                dx--
            }
            if (controls.isWalkRightHeld()) {
                dx++
            }
        }

        const speedMultiplier =
            (dx !== 0 || dy !== 0 ? this.pushCheck() : 1) * debug.speedMultiplier

        this._velocity = new Point(dx, dy)

        this.dude.move(
            updateData.elapsedTimeMillis,
            this.velocity,
            this.dude.rolling ? 0 : controls.getPlayerFacingDirection(this.dude),
            speedMultiplier
        )

        if (UIStateManager.instance.isMenuOpen) {
            return
        }

        // Check other user input

        this.checkHotKeys(updateData)

        if (!this.dude.jumping && controls.isJumpDown()) {
            this.dude.jump()
        } else if (!this.dude.rolling && controls.isRollDown() && (dx !== 0 || dy !== 0)) {
            this.dude.roll()
            this.rollingMomentum = new Point(dx, dy)
        }

        if (controls.isSheathKeyDown()) {
            const sheathed = !this.dude.weapon?.isSheathed() ?? false
            this.dude.setWeaponAndShieldDrawn(!sheathed)
        }

        let blocking = false
        if (!!this.dude.shield) {
            blocking = controls.isBlockHeld()
            this.dude.shield.block(blocking)
        }

        if (controls.isAttack(ButtonState.HELD) && !blocking) {
            const newAttack = controls.isAttack(ButtonState.DOWN)
            this.dude.weapon?.attack(newAttack)
        } else {
            this.dude.weapon?.cancelAttack()
        }

        if (controls.isInteractDown() && !!possibleInteractable) {
            possibleInteractable.interact()
        }
    }

    isOffMap(): "swamp" | "ocean" | undefined {
        if (this.dude.location.isInterior) {
            return
        }
        const range = here().range
        const pos = this.dude.tile
        if (pos.x < -range || pos.x > range || pos.y < -range || pos.y > range) {
            return pos.x > range - CampLocationGenerator.COAST_OCEAN_WIDTH ? "ocean" : "swamp"
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

    private checkHotKeys(updateData) {
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

    private checkIsOffMap(updateData: UpdateData) {
        const offMap = this.isOffMap()

        if (offMap && !CutscenePlayerController.instance.enabled) {
            this.timeOffMap += updateData.elapsedTimeMillis
        } else {
            this.timeOffMap = 0
            this.offMapWarningShown = false
        }

        if (this.timeOffMap > 2_500 && !this.offMapWarningShown) {
            if (here() === camp()) {
                TextOverlayManager.instance.open({
                    text: [
                        offMap === "ocean"
                            ? "Venturing into the ocean without a ship is certain death. Turn back while you still can."
                            : "Venturing deeper into the swamp alone is certain death. Turn back while you still can.",
                    ],
                    finishAction: "OKAY",
                    onFinish: () => (this.offMapWarningShown = true),
                    textAlign: TextAlign.CENTER,
                })
            } else {
                this.timeOffMap = 0
                const position = DudeSpawner.instance.getSpawnPosOutsideOfCamp()
                const currentLocation = here()
                LocationManager.instance.playerLoadLocation(camp(), position, () => {
                    LocationManager.instance.delete(currentLocation)
                    CutscenePlayerController.instance.enable()
                    CutscenePlayerController.instance.startMoving(Point.ZERO.minus(position))
                    setTimeout(() => CutscenePlayerController.instance.disable(), 1_000)
                })
            }
        } else if (this.timeOffMap > 10_000) {
            this.dude.damage(Number.MAX_SAFE_INTEGER, {})
        }
    }

    private updateInteractables(updateData: UpdateData) {
        const interactDistance = 20
        const interactCenter = this.dude.standingPosition.minus(new Point(0, 7))
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
