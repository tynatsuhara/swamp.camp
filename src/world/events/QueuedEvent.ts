import { Lists } from "brigsby/dist/util/Lists"
import { DudeFactory, DudeType } from "../../characters/DudeFactory"
import { DudeSpawner } from "../../characters/DudeSpawner"
import { NPC } from "../../characters/NPC"
import { Berto } from "../../characters/types/Berto"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { NotificationDisplay, Notifications } from "../../ui/NotificationDisplay"
import { Elements, ElementType } from "../elements/Elements"
import { HittableResource } from "../elements/HittableResource"
import { camp, LocationManager } from "../LocationManager"
import { collectTaxes } from "../TaxRate"
import { Day } from "../TimeUnit"
import { WorldTime } from "../WorldTime"
import { EventQueue } from "./EventQueue"

export enum QueuedEventType {
    SIMULATE_NPCS,
    HERALD_ARRIVAL,
    HERALD_DEPARTURE_CHECK,
    HERALD_RETURN_WITH_NPC,
    DAILY_SCHEDULE, // executes daily at midnight
    ORC_SEIGE,
    COLLECT_TAXES,
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
            camp()
        )
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)
    },

    [QueuedEventType.HERALD_DEPARTURE_CHECK]: (data) => {
        const goalPosition = LocationManager.instance.exteriorEntrancePosition()
        const berto = camp().getDude(DudeType.HERALD)
        if (!berto) {
            return
        }

        // check repeatedly until he's at the goal
        if (berto.standingPosition.distanceTo(goalPosition) > TILE_SIZE) {
            console.log("[Berto] en route -- potentially stuck")
            EventQueue.instance.addEvent({
                ...data,
                time: WorldTime.instance.future({ minutes: 2 }),
            })
        } else {
            console.log("[Berto] left the map")
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_RETURN_WITH_NPC,
                time: WorldTime.instance.future({ hours: 12 }),
                dudeTypes: data.dudeTypes,
            })
        }

        berto.entity.getComponent(Berto).updateSchedule()
    },

    [QueuedEventType.HERALD_RETURN_WITH_NPC]: (data) => {
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)

        const berto = camp().getDude(DudeType.HERALD)
        if (!berto) {
            throw new Error("berto should exist")
        }

        berto.entity.getComponent(Berto).updateSchedule()

        const typesToSpawn = (data.dudeTypes || [DudeType.VILLAGER]) as DudeType[]

        typesToSpawn.forEach((type) => {
            DudeFactory.instance.new(
                type,
                LocationManager.instance.exteriorEntrancePosition(),
                camp(),
                true // they already have a claimed residence
            )
        })
    },

    [QueuedEventType.DAILY_SCHEDULE]: () => {
        console.log(`executing daily schedule for ${Day[WorldTime.instance.currentDay]}`)

        // Collect taxes
        if (WorldTime.instance.currentDay === Day.MONDAY) {
            EventQueue.instance.addEvent({
                type: QueuedEventType.COLLECT_TAXES,
                time: WorldTime.instance.future({ hours: 8 }),
            })
        }

        // Replenish resources
        camp()
            .getElements()
            .map((e) => e.entity.getComponent(HittableResource)?.replenish())

        // Spawn rocks
        const rockFactory = Elements.instance.getElementFactory(ElementType.ROCK)
        const openTiles = camp()
            .getGroundSpots(true)
            .filter((tile) => !camp().isOccupied(tile) && rockFactory.canPlaceAtPos(camp(), tile))
        const rocksToSpawn = Math.random() * 5
        for (let i = 0; i < rocksToSpawn; i++) {
            camp().addElement(ElementType.ROCK, Lists.oneOf(openTiles))
        }

        EventQueue.instance.addEvent({
            type: QueuedEventType.DAILY_SCHEDULE,
            time: WorldTime.instance.tomorrow(),
        })
    },

    // TODO: This should wake up the player if they are sleeping
    [QueuedEventType.ORC_SEIGE]: () => DudeSpawner.instance.spawnOrcs(),

    [QueuedEventType.COLLECT_TAXES]: collectTaxes,
})
