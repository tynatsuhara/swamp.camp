import { Lists } from "brigsby/dist/util"
import { DudeFaction, DudeFactory } from "../../characters/DudeFactory"
import { DudeSpawner } from "../../characters/DudeSpawner"
import { DudeType } from "../../characters/DudeType"
import { NPC } from "../../characters/NPC"
import { Berto } from "../../characters/types/Berto"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { NotificationDisplay, Notifications } from "../../ui/NotificationDisplay"
import { Elements, ElementType } from "../elements/Elements"
import { HittableResource } from "../elements/HittableResource"
import { Queequeg } from "../elements/Queequeg"
import { camp, LocationManager } from "../locations/LocationManager"
import { collectTaxes } from "../TaxRate"
import { Day, TimeUnit } from "../TimeUnit"
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

    [QueuedEventType.HERALD_ARRIVAL]: () => {
        DudeFactory.instance.create(
            DudeType.HERALD,
            Queequeg.instance.entryTile.times(TILE_SIZE),
            camp()
        )
        NotificationDisplay.instance.push(Notifications.NEW_VILLAGER)
    },

    [QueuedEventType.HERALD_DEPARTURE_CHECK]: (data) => {
        const berto = camp().getDude(DudeType.HERALD)
        if (!berto) {
            return
        }

        const goalPosition = Queequeg.instance.entryTile.times(TILE_SIZE)
        const bertoDistance = berto.standingPosition.distanceTo(goalPosition)

        // check repeatedly until he's at the goal
        if (bertoDistance > TILE_SIZE * 1.7) {
            console.log("[Berto] en route -- potentially stuck")
            EventQueue.instance.addEvent({
                ...data,
                time: WorldTime.instance.future({ minutes: 2 }),
            })
        } else {
            const returnTime = WorldTime.instance.future({ hours: 12 })
            Queequeg.instance.pushPassenger(berto)
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_RETURN_WITH_NPC,
                time: returnTime,
                dudeTypes: data.dudeTypes,
            })
            Queequeg.instance.depart()
            console.log(
                `[Berto] left the map and will return at ${WorldTime.clockTime(returnTime)}`
            )
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

        // TODO: push all onto the queequeg
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
        const berto = camp().getDude(DudeType.HERALD)
        if (!berto) {
            throw new Error("berto should exist")
        }
        Queequeg.instance.removePassenger(berto)

        Queequeg.instance.getPassengers().forEach((dude) => {
            Queequeg.instance.removePassenger(dude)
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

        const allSpots = camp().getGroundSpots(true)
        const spawnResource = (type: ElementType, count: number) => {
            const typeFactory = Elements.instance.getElementFactory(type)
            const openTiles = allSpots.filter(
                (tile) => !camp().isOccupied(tile) && typeFactory.canPlaceAtPos(camp(), tile)
            )
            for (let i = 0; i < count; i++) {
                camp().addElement(type, Lists.oneOf(openTiles))
            }
        }

        // Spawn new resources
        spawnResource(ElementType.ROCK, Math.random() * 5)
        spawnResource(ElementType.BLACKBERRIES, Math.random() * 3)

        // Update town stats
        const foodAmount = 0 // TODO
        const villagerCount = LocationManager.instance
            .getLocations()
            .flatMap((l) => l.getDudes())
            .filter((d) => d.isAlive && d.factions.includes(DudeFaction.VILLAGERS)).length
        // TODO calculate food amount

        EventQueue.instance.addEvent({
            type: QueuedEventType.DAILY_SCHEDULE,
            time: WorldTime.instance.tomorrow(),
        })
    },

    // TODO: This should wake up the player if they are sleeping
    [QueuedEventType.ORC_SEIGE]: () => DudeSpawner.instance.spawnOrcs(),

    [QueuedEventType.COLLECT_TAXES]: collectTaxes,
})
