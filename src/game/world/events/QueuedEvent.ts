import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { MapGenerator } from "../MapGenerator"
import { LocationManager } from "../LocationManager"
import { NPCSchedules } from "../../characters/NPCSchedule"
import { NPC } from "../../characters/NPC"
import { TILE_SIZE, pixelPtToTilePt } from "../../graphics/Tilesets"
import { EventQueue } from "./EventQueue"
import { WorldTime } from "../WorldTime"
import { ElementType } from "../elements/Elements"
import { House } from "../elements/House"

export enum QueuedEventType {
    SIMULATE_NPCS,
    HERALD_ARRIVAL,
    HERALD_DEPARTURE,
    HERALD_RETURN_WITH_NPC,
}

export type QueuedEventData = {
    type: QueuedEventType,
    time: number,
    [others: string]: any;
}

export const EVENT_QUEUE_HANDLERS: { [type: number]: (data: QueuedEventData) => void } = {
    [QueuedEventType.SIMULATE_NPCS]: () => {
        LocationManager.instance.getLocations()
                .filter(l => l !== LocationManager.instance.currentLocation)
                .flatMap(l => Array.from(l.dudes))
                .forEach(d => d.entity.getComponent(NPC).simulate())

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY
        })
    },

    [QueuedEventType.HERALD_ARRIVAL]: () => {
        DudeFactory.instance.new(DudeType.HERALD, MapGenerator.ENTER_LAND_POS, LocationManager.instance.exterior())
        console.log("the trader is here (ノ ″ロ″)ノ")
    },

    [QueuedEventType.HERALD_DEPARTURE]: (data) => {
        const goalPosition = MapGenerator.ENTER_LAND_POS
        const berto = LocationManager.instance.exterior().getDude(DudeType.HERALD)
        if (!berto) {
            return
        }

        const npc = berto.entity.getComponent(NPC)
        const sched = data.oldSchedule || npc.getSchedule()
        npc.setSchedule(NPCSchedules.newGoToSchedule(pixelPtToTilePt(goalPosition)))

        // check repeatedly until he's at the goal
        if (berto.standingPosition.distanceTo(goalPosition) > TILE_SIZE) {
            console.log("still en route -- potentially stuck")
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_DEPARTURE,
                time: WorldTime.instance.future({ minutes: 2 }),
                oldSchedule: sched
            })
        } else {
            console.log("we've arrived!")
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_RETURN_WITH_NPC,
                time: WorldTime.instance.future({ hours: 12 }),
                normalSchedule: sched
            })
        }
    },

    [QueuedEventType.HERALD_RETURN_WITH_NPC]: (data) => {
        console.log("we're back, baby!")

        const berto = LocationManager.instance.exterior().getDude(DudeType.HERALD)
        if (!berto) {
            return
        }

        berto.entity.getComponent(NPC).setSchedule(data.normalSchedule)

        const villager = DudeFactory.instance.new(DudeType.VILLAGER, MapGenerator.ENTER_LAND_POS, LocationManager.instance.exterior())
        const house = LocationManager.instance.exterior().getElementsOfType(ElementType.HOUSE)
                .map(e => e.entity.getComponent(House))
                .filter(house => house.isResidentPending())[0]
        house?.setResident(villager.uuid)
    },
}