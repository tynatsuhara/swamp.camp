import { Component, Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists, Maths } from "brigsby/dist/util"
import { PointAudio } from "../../audio/PointAudio"
import { CAMPFIRE_DIALOGUE } from "../../characters/dialogue/CampfireDialogue"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { ROCKS_NEEDED_FOR_CAMPFIRE } from "../../characters/dialogue/DipDialogue"
import { Dude } from "../../characters/Dude"
import { player } from "../../characters/player/index"
import { ShieldType } from "../../characters/weapons/ShieldType"
import { FireParticles } from "../../graphics/particles/FireParticles"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { session } from "../../online/session"
import { clientSyncFn } from "../../online/syncUtils"
import { randomByteString } from "../../saves/uuid"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { GroundRenderer } from "../ground/GroundRenderer"
import { LightManager } from "../LightManager"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshObstacle } from "./NavMeshObstacle"
import { RestPoint } from "./RestPoint"

type SaveData = {
    logs: number
    llct: number // ast log consumed time
    id: string
}

export class CampfireFactory extends ElementFactory<ElementType.CAMPFIRE, SaveData> {
    readonly type = ElementType.CAMPFIRE
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.CAMPFIRE)
    }

    make(wl: Location, pos: Point, data: SaveData) {
        data.id ??= randomByteString()

        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 12

        const campfireSprite = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("campfireRing"),
                SpriteTransform.new({ position: scaledPos, depth: GroundRenderer.DEPTH + 10 })
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

        e.addComponent(new RestPoint())

        const fire = e.addComponent(
            new FireParticles(1, () =>
                campfireSprite.transform.position.plus(new Point(TILE_SIZE / 2 - 1, 7))
            )
        )

        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))

        const audio = e.addComponent(
            new PointAudio("audio/ambiance/campfire.ogg", pixelCenterPos, TILE_SIZE * 6)
        )

        const updateFire = (logCount: number) => {
            logSprite.enabled = logCount > Campfire.LOG_CAPACITY / 2
            logSpriteSmall.enabled = logCount > 0 && !logSprite.enabled

            fire.enabled = logCount > 0
            // fireSize can be in range [1, 5]
            fire.radius = Math.ceil((logCount / Campfire.LOG_CAPACITY) * 5)
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

        updateFire(data.logs ?? 0)

        const updateFireSync = wl.elementSyncFn("fire", pos, updateFire)

        const cf = e.addComponent(
            new Campfire(data.id, data.logs ?? 0, data.llct ?? 0, (logCount) => {
                if (session.isHost()) {
                    updateFireSync(logCount)
                }
            })
        )

        e.addComponent(
            new Breakable(
                pixelCenterPos,
                [campfireSprite.transform, logSprite.transform, logSpriteSmall.transform],
                () =>
                    Lists.repeat(cf.logs, [{ item: Item.WOOD }]).concat(
                        Lists.repeat(ROCKS_NEEDED_FOR_CAMPFIRE, [{ item: Item.ROCK }])
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
                new Point(1, -TILE_SIZE),
                (interactor) => interactor === player()
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.CAMPFIRE, pos, () => {
                return { logs: cf.logs, llct: Math.floor(cf.lastLogConsumedTime), id: data.id }
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

    constructor(
        id: string,
        logs: number,
        lastLogConsumedTime: number,
        updateFire: (logs: number) => void
    ) {
        super()
        this.logs = logs
        this.lastLogConsumedTime = lastLogConsumedTime
        this.updateFire = updateFire
        updateFire(this.logs)

        this.addLogs = clientSyncFn(id, "all", ({ dudeUUID }, logsTransferred: number) => {
            const interactingPlayer = Dude.get(dudeUUID)
            logsTransferred = Maths.clamp(logsTransferred, -1, 1)
            if (session.isHost()) {
                if (logsTransferred === -1) {
                    // set NONE first to make sure they always get a fully-lit torch
                    interactingPlayer.setShield(ShieldType.NONE, -1)
                    interactingPlayer.setShield(ShieldType.TORCH, -1)
                }
            }
            this._addLogs(logsTransferred)
        })
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

    private _addLogs(count: number) {
        if (this.logs === 0) {
            this.lastLogConsumedTime = WorldTime.instance.time
        }
        this.logs += count
        this.updateFire(this.logs)
    }

    /**
     * Send a request to the host to add logs to fire
     * @param logsTransferred the number of logs added to the fire, could be negative if taking a torch
     */
    addLogs: (logsTransferred: number) => void

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
