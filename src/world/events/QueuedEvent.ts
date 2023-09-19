import { DudeFactory } from "../../characters/DudeFactory"
import { DudeSpawner } from "../../characters/DudeSpawner"
import { DudeType } from "../../characters/DudeType"
import { NPC } from "../../characters/NPC"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { NotificationDisplay, Notifications } from "../../ui/NotificationDisplay"
import { Queequeg } from "../elements/Queequeg"
import { camp, LocationManager } from "../locations/LocationManager"
import { Day, TimeUnit } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { doDailyEvents, doDailyMorningEvents } from "./DailyEvents"
import { EventQueue } from "./EventQueue"

export enum QueuedEventType {
    SIMULATE_NPCS,
    NEW_VILLAGERS_ARRIVAL,
    DAILY_SCHEDULE, // executes daily at midnight
    ORC_SEIGE,
    DAILY_MORNING,
    QUEEQUEG_DISEMBARK_PASSENGERS,
}

export type QueuedEventData = {
    type: QueuedEventType
    time: number
    [others: string]: any
}

export const getEventQueueHandlers = (): {
    [type: number]: (data: QueuedEventData) => void
} => ({
    [QueuedEventType.SIMULATE_NPCS]: () => {
        LocationManager.instance.simulateLocations(false, NPC.SCHEDULE_FREQUENCY)

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY,
        })
    },

    [QueuedEventType.NEW_VILLAGERS_ARRIVAL]: (data) => {
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)

        const typesToSpawn = data.dudeTypes as DudeType[]

        typesToSpawn.forEach((type) => {
            const dude = DudeFactory.instance.create(
                type,
                Queequeg.instance.entryTile.plusX(10).times(TILE_SIZE),
                camp(),
                true // they already have a claimed residence
            )
            Queequeg.instance.pushPassenger(dude)
        })

        Queequeg.instance.arrive()

        EventQueue.instance.addEvent({
            type: QueuedEventType.QUEEQUEG_DISEMBARK_PASSENGERS,
            time: data.time + TimeUnit.MINUTE * 5,
        })
    },

    [QueuedEventType.QUEEQUEG_DISEMBARK_PASSENGERS]: () => {
        Queequeg.instance.getPassengers().forEach((dude) => {
            Queequeg.instance.removePassenger(dude)
        })
    },

    [QueuedEventType.DAILY_SCHEDULE]: () => {
        console.log(`executing daily midnight schedule for ${Day[WorldTime.instance.currentDay]}`)
        doDailyEvents()

        // Some events happen in the morning
        EventQueue.instance.addEvent({
            type: QueuedEventType.DAILY_MORNING,
            time: WorldTime.instance.future({ hours: 8 }),
        })

        EventQueue.instance.addEvent({
            type: QueuedEventType.DAILY_SCHEDULE,
            time: WorldTime.instance.tomorrow(),
        })
    },

    [QueuedEventType.DAILY_MORNING]: () => {
        console.log(`executing daily morning schedule for ${Day[WorldTime.instance.currentDay]}`)
        doDailyMorningEvents()
    },

    // TODO: This should wake up the player if they are sleeping
    [QueuedEventType.ORC_SEIGE]: () => DudeSpawner.instance.spawnOrcs(),
})
