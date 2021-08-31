import { Component } from "brigsby/dist/Component"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { AnimatedSpriteComponent } from "brigsby/dist/sprites/AnimatedSpriteComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Point } from "brigsby/dist/Point"
import { Interactable } from "./Interactable"
import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { ElementComponent } from "./ElementComponent"
import { WorldLocation } from "../WorldLocation"
import { Entity } from "brigsby/dist/Entity"
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
import { Breakable } from "./Breakable"
import { Item } from "../../items/Items"
import { Lists } from "brigsby/dist/util/Lists"
import { ROCKS_NEEDED_FOR_CAMPFIRE, WOOD_NEEDED_FOR_CAMPFIRE } from "../../characters/dialogues/DipDialogue"

export class CampfireFactory extends ElementFactory {

    readonly type = ElementType.CAMPFIRE
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: any): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 10
        
        const campfireOff = e.addComponent(new SpriteComponent(
            Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), 
            new SpriteTransform(scaledPos)
        ))
        campfireOff.transform.depth = depth

        const campfireOn = e.addComponent(new AnimatedSpriteComponent(
            [Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)],
            new SpriteTransform(scaledPos)
        ))
        campfireOn.transform.depth = depth

        const offset = new Point(0, 5)
        e.addComponent(new BoxCollider(
            scaledPos.plus(offset), 
            new Point(TILE_SIZE, TILE_SIZE).minus(offset)
        ))

        const logsOnFire = data.logs ?? 0
        const lastLogConsumedTime = data.llct ?? 0

        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))

        e.addComponent(new Breakable(
            pixelCenterPos, 
            [campfireOff.transform, campfireOn.transform], 
            () => Lists.repeat(WOOD_NEEDED_FOR_CAMPFIRE/2, [Item.WOOD]).concat(Lists.repeat(ROCKS_NEEDED_FOR_CAMPFIRE/2, [Item.ROCK]))
        ))

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
                LightManager.instance.addLight(wl, e, lightCenterPos, Campfire.getLightSizeForLogCount(logCount))
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

    canPlaceInLocation(wl: WorldLocation) {
        return wl === LocationManager.instance.exterior()
    }
}

export class Campfire extends Component implements DialogueSource {

    static readonly LOG_CAPACITY = 12
    static readonly LOG_DURATION_HOURS = 2
    private static readonly LOG_DURATION = Campfire.LOG_DURATION_HOURS * TimeUnit.HOUR

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

    static getLightSizeForLogCount(logs: number) {
        return TILE_SIZE * (5 + logs/2)
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

    willBurnFor(duration: number) {
        // this gets called when the campfire is not loaded, so we need for force an update
        this.update()

        if (this.logs === 0) {
            return duration === 0
        }
        const currentLogTimeLeft = Campfire.LOG_DURATION - (WorldTime.instance.time - this.lastLogConsumedTime)/Campfire.LOG_DURATION
        return duration < (this.logs-1) * Campfire.LOG_DURATION + currentLogTimeLeft
    }

    delete() {
        super.delete()
        this.updateFire(0)
    }
}