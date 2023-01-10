import { Point, UpdateData } from "brigsby/dist"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { controls } from "../../Controls"
import { CutscenePlayerController } from "../../cutscenes/CutscenePlayerController"
import { TextOverlayManager } from "../../cutscenes/TextOverlayManager"
import { Item } from "../../items/Items"
import { saveManager } from "../../SaveManager"
import { NotificationDisplay } from "../../ui/NotificationDisplay"
import { TextAlign } from "../../ui/Text"
import { Location } from "../../world/locations/Location"
import { camp, here, LocationManager } from "../../world/locations/LocationManager"
import { RadiantLocationGenerator } from "../../world/locations/RadiantLocationGenerator"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
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

    awake(): void {
        super.awake()

        const saveInterval = 15_000
        this.entity.addComponent(
            new RepeatedInvoker(() => {
                saveManager.autosave()
                return saveInterval
            }, saveInterval)
        )

        window["addItem"] = this.dude.inventory.addItem
    }

    update(updateData: UpdateData) {
        if (!this.dude.isAlive) {
            return
        }

        const playerControls = this.serializeControls()

        // MPTODO
        this.checkIsOffMap(updateData)

        const possibleInteractable = this.updateInteractables(updateData, true)

        // Determine player movement
        this.doMovementOnHost(updateData.elapsedTimeMillis, playerControls)

        if (controls.isInteractDown() && possibleInteractable) {
            possibleInteractable.interact(this.dude)
        }

        this.checkHotKeys(updateData)
    }

    private checkIsOffMap(updateData: UpdateData) {
        const currentOffMapArea = this.dude.getCurrentOffMapArea()
        const isInOcean = here() === camp() && currentOffMapArea === "right"

        if (
            currentOffMapArea &&
            !CutscenePlayerController.instance.enabled &&
            !TextOverlayManager.instance.isActive
        ) {
            this.timeOffMap += updateData.elapsedTimeMillis
        } else {
            this.timeOffMap = 0
            this.offMapWarningShown = false
        }

        // MPTODO figure out the desired behavior here
        if (
            this.timeOffMap > 2_000 &&
            !this.offMapWarningShown &&
            !TextOverlayManager.instance.isActive
        ) {
            const travelToLocation = (l: Location): Promise<void> =>
                new Promise((resolve) => {
                    this.timeOffMap = 0
                    const position = DudeSpawner.instance.getSpawnPosOutsideOfLocation(l, [
                        currentOffMapArea,
                    ])
                    LocationManager.instance.playerLoadLocation(l, position, () => {
                        WorldTime.instance.fastForward(TimeUnit.HOUR)
                        CutscenePlayerController.instance.enable()
                        CutscenePlayerController.instance.startMoving(Point.ZERO.minus(position))
                        setTimeout(() => CutscenePlayerController.instance.disable(), 1_250)
                        resolve()
                    })
                })

            const showDangerWarning = () =>
                TextOverlayManager.instance.open({
                    text: [
                        isInOcean
                            ? "Venturing into the ocean without a ship is certain death. Turn back while you still can."
                            : "Venturing deeper into the swamp without a map is certain death. Turn back while you still can.",
                    ],
                    finishAction: "OKAY",
                    onFinish: () => (this.offMapWarningShown = true),
                    textAlign: TextAlign.CENTER,
                    pauseBackground: false,
                })

            if (here() === camp()) {
                const [exploreMap, mapIndex] = this.dude.inventory.find(
                    (stack) => stack?.item === Item.EXPLORER_MAP
                )
                if (exploreMap && !isInOcean) {
                    // Kick off an expedition
                    this.dude.inventory.setStack(
                        mapIndex,
                        exploreMap.withMetadata({ locations: 3 })
                    )
                    const radiantLocation = RadiantLocationGenerator.instance.generate()
                    travelToLocation(radiantLocation)
                } else {
                    showDangerWarning()
                }
            } else {
                const [activeMap, mapIndex] = this.dude.inventory.find(
                    (stack) => stack?.item === Item.EXPLORER_MAP && stack.metadata.locations
                )
                const lastUsage = activeMap?.metadata.locations === 1
                // We could make it so they die if they no longer have their map, but that probably won't happen
                let nextLocation =
                    activeMap && !lastUsage ? RadiantLocationGenerator.instance.generate() : camp()
                if (lastUsage) {
                    this.dude.inventory.removeItemAtIndex(mapIndex)
                } else {
                    this.dude.inventory.setStack(
                        mapIndex,
                        activeMap.withMetadata({ locations: activeMap.metadata.locations - 1 })
                    )
                }
                const abandonedRadiantLocation = here()
                travelToLocation(nextLocation).then(() => {
                    LocationManager.instance.delete(abandonedRadiantLocation)
                    if (lastUsage) {
                        NotificationDisplay.instance.push({
                            icon: "tent",
                            text: "expedition complete",
                        })
                    }
                })
            }
        } else if (this.timeOffMap > 10_000) {
            this.dude.damage(Number.MAX_SAFE_INTEGER, {})
        }
    }
}
