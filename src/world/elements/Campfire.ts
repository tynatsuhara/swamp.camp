import { Component, Entity, Point } from "brigsby/lib"
import { SpriteComponent, SpriteTransform } from "brigsby/lib/sprites"
import { Lists } from "brigsby/lib/util"
import { PointAudio } from "../../audio/PointAudio"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { ROCKS_NEEDED_FOR_CAMPFIRE } from "../../characters/dialogue/DipDialogue"
import { CAMPFIRE_DIALOGUE } from "../../characters/dialogue/ItemDialogues"
import { FireParticles } from "../../graphics/particles/FireParticles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { LightManager } from "../LightManager"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshObstacle } from "./NavMeshObstacle"

export class CampfireFactory extends ElementFactory {
    readonly type = ElementType.CAMPFIRE
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 12

        const campfireSprite = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireRing"),
                SpriteTransform.new({ position: scaledPos, depth })
            )
        )

        const logSprite = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireLogs"),
                SpriteTransform.new({ position: scaledPos, depth: depth + 1 })
            )
        )

        const logSpriteSmall = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireLogsSmall"),
                SpriteTransform.new({ position: scaledPos, depth: depth + 1 })
            )
        )

        e.addComponent(new NavMeshObstacle(wl, pos))

        const fire = e.addComponent(
            new FireParticles(1, () =>
                campfireSprite.transform.position.plus(new Point(TILE_SIZE / 2 - 1, 7))
            )
        )

        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))

        const audio = e.addComponent(
            new PointAudio("audio/ambiance/campfire.ogg", pixelCenterPos, TILE_SIZE * 6, true)
        )

        const updateFire = (logCount: number) => {
            logSprite.enabled = logCount > Campfire.LOG_CAPACITY / 2
            logSpriteSmall.enabled = logCount > 0 && !logSprite.enabled

            fire.enabled = logCount > 0
            // fireSize can be in range [1, 5]
            fire.size = Math.ceil((logCount / Campfire.LOG_CAPACITY) * 5)
            audio.setMultiplier(logCount === 0 ? 0 : 1)
            const lightCenterPos = pos
                .times(TILE_SIZE)
                .plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
            if (fire.enabled) {
                LightManager.instance.addLight(
                    wl,
                    e,
                    lightCenterPos,
                    Campfire.getLightSizeForLogCount(logCount)
                )
            } else {
                LightManager.instance.removeLight(e)
            }
        }

        const cf = e.addComponent(new Campfire(data.logs ?? 0, data.llct ?? 0, updateFire))

        e.addComponent(
            new Breakable(
                pixelCenterPos,
                [campfireSprite.transform, logSprite.transform, logSpriteSmall.transform],
                () =>
                    Lists.repeat(cf.logs, [Item.WOOD]).concat(
                        Lists.repeat(ROCKS_NEEDED_FOR_CAMPFIRE, [Item.ROCK])
                    )
            )
        )

        // Toggle between on/off when interacted with
        e.addComponent(
            new Interactable(
                pixelCenterPos,
                () => {
                    DialogueDisplay.instance.startDialogue(cf)
                },
                new Point(1, -TILE_SIZE)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.CAMPFIRE, pos, () => {
                return { logs: cf.logs, llct: cf.lastLogConsumedTime }
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }
}

export class Campfire extends Component implements DialogueSource {
    static readonly LOG_CAPACITY = 12
    static readonly LOG_DURATION_HOURS = 2
    private static readonly LOG_DURATION = Campfire.LOG_DURATION_HOURS * TimeUnit.HOUR

    dialogue: string = CAMPFIRE_DIALOGUE
    logs: number
    lastLogConsumedTime: number

    public get isBurning() {
        return this.logs > 0
    }

    private updateFire: (logs: number) => void

    constructor(logs: number, lastLogConsumedTime: number, updateFire: (logs: number) => void) {
        super()
        this.logs = logs
        this.lastLogConsumedTime = lastLogConsumedTime
        this.updateFire = updateFire
        updateFire(this.logs)
    }

    static getLightSizeForLogCount(logs: number) {
        return TILE_SIZE * (5 + logs / 2)
    }

    update() {
        const logsBeforeUpdate = this.logs
        while (
            this.logs > 0 &&
            WorldTime.instance.time > this.lastLogConsumedTime + Campfire.LOG_DURATION
        ) {
            this.lastLogConsumedTime += Campfire.LOG_DURATION
            this.logs--
        }
        if (logsBeforeUpdate !== this.logs) {
            this.updateFire(this.logs)
        }
    }

    addLogs(count: number) {
        if (this.logs === 0) {
            this.lastLogConsumedTime = WorldTime.instance.time
        }
        this.logs += count
        this.updateFire(this.logs)
    }

    willBurnFor(duration: number) {
        // this gets called when the campfire is not loaded, so we need for force an update
        this.update()

        if (this.logs === 0) {
            return duration === 0
        }
        const currentLogTimeLeft =
            Campfire.LOG_DURATION -
            (WorldTime.instance.time - this.lastLogConsumedTime) / Campfire.LOG_DURATION
        return duration < (this.logs - 1) * Campfire.LOG_DURATION + currentLogTimeLeft
    }

    delete() {
        super.delete()
        this.updateFire(0)
    }
}
