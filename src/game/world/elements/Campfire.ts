import { Component } from "../../../engine/Component"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/Point"
import { Interactable } from "./Interactable"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { ElementComponent } from "./ElementComponent"
import { WorldLocation } from "../WorldLocation"
import { Entity } from "../../../engine/Entity"
import { ElementType } from "./Elements"
import { DialogueSource } from "../../characters/Dialogue"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { WorldTime } from "../WorldTime"
import { TimeUnit } from "../TimeUnit"
import { CAMPFIRE_DIALOGUE } from "../../characters/dialogues/ItemDialogues"
import { ElementFactory } from "./ElementFactory"
import { LocationManager } from "../LocationManager"
import { PointAudio } from "../../audio/PointAudio"
import { LightManager } from "../LightManager"

export class CampfireFactory extends ElementFactory {

    readonly type = ElementType.CAMPFIRE
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 10
        
        const campfireOff = e.addComponent(new TileComponent(
            Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), 
            new TileTransform(scaledPos)
        ))
        campfireOff.transform.depth = depth

        const campfireOn = e.addComponent(new AnimatedTileComponent(
            [Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)],
            new TileTransform(scaledPos)
        ))
        campfireOn.transform.depth = depth

        const offset = new Point(0, 5)
        e.addComponent(new BoxCollider(
            scaledPos.plus(offset), 
            new Point(TILE_SIZE, TILE_SIZE).minus(offset)
        ))

        const logsOnFire = data["logs"] ?? 0
        const lastLogConsumedTime = data["llct"] ?? 0

        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))

        const audio = e.addComponent(new PointAudio(
            "audio/ambiance/campfire.ogg",
            pixelCenterPos,
            TILE_SIZE * 6,
            true
        ))

        const updateFire = (logCount: number) => {
            campfireOff.enabled = logCount === 0
            campfireOn.enabled = !campfireOff.enabled
            audio.setMultiplier(logCount === 0 ? 0 : 1)
            const lightCenterPos = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
            if (campfireOn.enabled) {
                LightManager.instance.addLight(wl, e, lightCenterPos, TILE_SIZE * (5 + logCount/2))
            } else {
                LightManager.instance.removeLight(wl, e)
            }
        }

        const cf = e.addComponent(new Campfire(logsOnFire, lastLogConsumedTime, updateFire))

        // Toggle between on/off when interacted with
        e.addComponent(new Interactable(
            pixelCenterPos, 
            () => {
                DialogueDisplay.instance.startDialogue(cf)
            }, 
            new Point(1, -TILE_SIZE),
        ))

        return e.addComponent(new ElementComponent(
            ElementType.CAMPFIRE, 
            pos,
            [pos], 
            () => { return { logs: cf.logs, llct: cf.lastLogConsumedTime } }
        ))
    }

    canPlace(pos: Point) {
        return LocationManager.instance.currentLocation === LocationManager.instance.exterior()
    }
}

export class Campfire extends Component implements DialogueSource {

    static LOG_CAPACITY = 12
    static LOG_DURATION_HOURS = 2
    private static LOG_DURATION = Campfire.LOG_DURATION_HOURS * TimeUnit.HOUR

    dialogue: string = CAMPFIRE_DIALOGUE
    logs: number
    lastLogConsumedTime: number
    private updateFire: (logs: number) => void

    constructor(logs: number, lastLogConsumedTime: number, updateFire: (logs: number) => void) {
        super()
        this.logs = logs
        this.lastLogConsumedTime = lastLogConsumedTime
        this.updateFire = updateFire
        updateFire(this.logs)
    }

    update() {
        const logsBeforeUpdate = this.logs
        while (this.logs > 0 && WorldTime.instance.time > this.lastLogConsumedTime + Campfire.LOG_DURATION) {
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
}