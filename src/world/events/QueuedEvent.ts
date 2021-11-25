import { NPCSchedules } from "../../characters/ai/NPCSchedule"
import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { DudeSpawner } from "../../characters/DudeSpawner"
import { NPC } from "../../characters/NPC"
import { pixelPtToTilePt, TILE_SIZE } from "../../graphics/Tilesets"
import { NotificationDisplay, Notifications } from "../../ui/NotificationDisplay"
import { LocationManager } from "../LocationManager"
import { WorldTime } from "../WorldTime"
import { EventQueue } from "./EventQueue"

export enum QueuedEventType {
    SIMULATE_NPCS,
    HERALD_ARRIVAL,
    HERALD_DEPARTURE,
    HERALD_RETURN_WITH_NPC,
    DAILY_SCHEDULE, // executes daily at midnight
    ORC_SEIGE,
}

export type QueuedEventData = {
    type: QueuedEventType
    time: number
    [others: string]: any
}

export const EVENT_QUEUE_HANDLERS: {
    [type: number]: (data: QueuedEventData) => void
} = {
    [QueuedEventType.SIMULATE_NPCS]: () => {
        LocationManager.instance.simulateLocations(false)

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY,
        })
    },

    [QueuedEventType.HERALD_ARRIVAL]: () => {
        DudeFactory.instance.new(
            DudeType.HERALD,
            LocationManager.instance.exteriorEntrancePosition(),
            LocationManager.instance.exterior()
        )
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)
    },

    [QueuedEventType.HERALD_DEPARTURE]: (data) => {
        const goalPosition = LocationManager.instance.exteriorEntrancePosition()
        const berto = LocationManager.instance.exterior().getDude(DudeType.HERALD)
        if (!berto) {
            return
        }

        const npc = berto.entity.getComponent(NPC)
        const normalSchedule = data.oldSchedule || npc.getSchedule()
        npc.setSchedule(NPCSchedules.newGoToSchedule(pixelPtToTilePt(goalPosition)))

        // check repeatedly until he's at the goal
        if (berto.standingPosition.distanceTo(goalPosition) > TILE_SIZE) {
            console.log("[Berto] en route -- potentially stuck")
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_DEPARTURE,
                time: WorldTime.instance.future({ minutes: 2 }),
                oldSchedule: normalSchedule,
            })
        } else {
            console.log("[Berto] left the map")
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_RETURN_WITH_NPC,
                time: WorldTime.instance.future({ hours: 12 }),
                normalSchedule,
                dudeTypes: data.dudeTypes,
            })
        }
    },

    [QueuedEventType.HERALD_RETURN_WITH_NPC]: (data) => {
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)

        const berto = LocationManager.instance.exterior().getDude(DudeType.HERALD)
        if (!berto) {
            throw new Error("berto should exist")
        }

        berto.entity.getComponent(NPC).setSchedule(data.normalSchedule)

        const typesToSpawn = (data.dudeTypes || [DudeType.VILLAGER]) as DudeType[]

        typesToSpawn.forEach((type) => {
            DudeFactory.instance.new(
                type,
                LocationManager.instance.exteriorEntrancePosition(),
                LocationManager.instance.exterior()
            )
        })
    },

    [QueuedEventType.DAILY_SCHEDULE]: () => {
        console.log("daily schedule task executed")
        EventQueue.instance.addEvent({
            type: QueuedEventType.DAILY_SCHEDULE,
            time: WorldTime.instance.tomorrow(),
        })
    },

    // TODO: This should wake up the player if they are sleeping
    [QueuedEventType.ORC_SEIGE]: () => DudeSpawner.instance.spawnOrcs(),
}
