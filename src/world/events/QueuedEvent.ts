import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { LocationManager } from "../LocationManager"
import { NPCSchedules } from "../../characters/ai/NPCSchedule"
import { NPC } from "../../characters/NPC"
import { TILE_SIZE, pixelPtToTilePt } from "../../graphics/Tilesets"
import { EventQueue } from "./EventQueue"
import { WorldTime } from "../WorldTime"
import { ElementType } from "../elements/Elements"
import { House } from "../elements/House"
import { NotificationDisplay, Notifications } from "../../ui/NotificationDisplay"

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
        LocationManager.instance.simulateLocations(false)

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY
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
        const sched = data.oldSchedule || npc.getScheduledTask()
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
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)

        const berto = LocationManager.instance.exterior().getDude(DudeType.HERALD)
        if (!berto) {
            throw new Error("berto should exist")
        }

        berto.entity.getComponent(NPC).setSchedule(data.normalSchedule)

        // spawn villager and assign him a home
        const villager = DudeFactory.instance.new(
            DudeType.VILLAGER, 
            LocationManager.instance.exteriorEntrancePosition(), 
            LocationManager.instance.exterior()
        )
        const house = LocationManager.instance.exterior().getElementsOfType(ElementType.HOUSE)
                .map(e => e.entity.getComponent(House))
                .filter(house => house.isResidentPending())[0]
        house?.claimPendingSlot(villager.uuid)
    },
}