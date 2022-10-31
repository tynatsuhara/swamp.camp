import { Point, UpdateData } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { controls } from "../../Controls"
import { CutscenePlayerController } from "../../cutscenes/CutscenePlayerController"
import { TextOverlayManager } from "../../cutscenes/TextOverlayManager"
import { ITEM_METADATA_MAP } from "../../items/Items"
import { TextAlign } from "../../ui/Text"
import { Interactable } from "../../world/elements/Interactable"
import { camp, here, LocationManager } from "../../world/locations/LocationManager"
import { DudeSpawner } from "../DudeSpawner"
import { AbstractPlayer } from "./AbstractPlayer"
import { registerPlayerInstance as registerLocalPlayerInstance } from "./index"

export class HostPlayer extends AbstractPlayer {
    private offMapWarningShown = false
    private timeOffMap = 0

    constructor() {
        super()
        registerLocalPlayerInstance(this)
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        const playerControls = this.getSerializablePlayerControls()

        // MPTODO
        this.checkIsOffMap(updateData)

        const possibleInteractable = this.updateInteractables(updateData)

        // Determine player movement

        this.doMovementOnHost(updateData.elapsedTimeMillis, playerControls)

        // MPTODO
        if (controls.isInteractDown() && !!possibleInteractable) {
            possibleInteractable.interact()
        }

        // MPTODO
        this.checkHotKeys(updateData)
    }

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
        const offMap = this.dude.getCurrentOffMapArea()

        if (offMap && !CutscenePlayerController.instance.enabled) {
            this.timeOffMap += updateData.elapsedTimeMillis
        } else {
            this.timeOffMap = 0
            this.offMapWarningShown = false
        }

        // MPTODO figure out the desired behavior here
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
                // This is a radiant location — go back to camp
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
