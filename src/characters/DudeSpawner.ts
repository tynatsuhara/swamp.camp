import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { DarknessMask } from "../world/DarknessMask"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { Ground } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { LocationManager } from "../world/LocationManager"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { DudeFaction, DudeFactory, DudeType } from "./DudeFactory"

export class DudeSpawner extends Component {
    static get instance() {
        return Singletons.getOrCreate(DudeSpawner)
    }

    private static readonly INTERVAL_MILLIS = 30_000
    private nextUpdate = WorldTime.instance.time

    update() {
        const now = WorldTime.instance.time
        if (now > this.nextUpdate) {
            this.spawn()
            this.nextUpdate = now + DudeSpawner.INTERVAL_MILLIS
        }

        // Maybe consider moving this code elsewhere later
        WorldAudioContext.instance.isInBattle = Array.from(
            LocationManager.instance.exterior().dudes.values()
        ).some((d) => d.isAlive && d.factions.includes(DudeFaction.ORCS))
    }

    getEntity() {
        return new Entity([this])
    }

    private spawn() {
        this.spawnDemons()
        this.spawnSwampThings()
        this.checkForOrcSeige()
        this.spawnWildlife()
    }

    private spawnDemons() {
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY
        if (timeOfDay >= DarknessMask.SUNRISE_START && timeOfDay < DarknessMask.SUNSET_END) {
            return
        }

        const l = LocationManager.instance.currentLocation
        if (l.isInterior) {
            return // don't spawn demons inside
        }
        const demons = Array.from(l.dudes.values()).filter((d) =>
            d.factions.includes(DudeFaction.DEMONS)
        )
        if (demons.length > 0) {
            return // just wait to spawn until all the demons have been killed
        }
        const goalDemonCount = Math.random() * 5

        if (demons.length < goalDemonCount) {
            const openPoints = l
                .getGroundSpots()
                .filter(
                    (pt) =>
                        !l.isOccupied(pt) &&
                        LightManager.instance.isTotalDarkness(pt.times(TILE_SIZE))
                )

            for (let i = 0; i < Math.min(openPoints.length, goalDemonCount - demons.length); i++) {
                const pt = Lists.oneOf(openPoints)
                const type = Math.random() > 0.95 ? DudeType.DEMON_BRUTE : DudeType.HORNED_DEMON
                DudeFactory.instance.new(type, pt.times(TILE_SIZE), l)
            }
        }
    }

    private spawnSwampThings() {
        const l = LocationManager.instance.currentLocation
        if (l.isInterior) {
            return // don't spawn swamp things inside
        }

        const thingCount = Array.from(l.dudes.values()).filter(
            (d) => d.type === DudeType.SWAMP_THING
        )

        const waterSpots = l
            .getGroundSpots(true)
            .filter((pt) => Ground.isWater(l.getGround(pt)?.type))

        const goalCount = waterSpots.length / 50

        // TODO: Some way to make swamp things not spawn?

        if (thingCount.length < goalCount) {
            const spawnCount = Math.min(waterSpots.length, goalCount - thingCount.length)
            console.log(`spawning ${spawnCount} swamp things`)
            for (let i = 0; i < spawnCount; i++) {
                const pt = Lists.oneOf(waterSpots)
                DudeFactory.instance.new(DudeType.SWAMP_THING, pt.times(TILE_SIZE), l)
            }
        }
    }

    private checkForOrcSeige() {
        if (!EventQueue.instance.containsEventType(QueuedEventType.ORC_SEIGE)) {
            const nextSeigeTime = WorldTime.instance.future({ days: 2 + Math.random() * 3 })
            EventQueue.instance.addEvent({
                type: QueuedEventType.ORC_SEIGE,
                time: nextSeigeTime,
            })
        }
    }

    spawnOrcs() {
        setTimeout(
            () =>
                NotificationDisplay.instance.push({
                    text: "Orc attack!",
                    icon: "sword",
                }),
            6500
        )

        const spawnPos = this.getSpawnPosOffMap()

        Lists.range(0, 5 + Math.random() * 10).forEach(() =>
            DudeFactory.instance.new(DudeType.ORC_WARRIOR, spawnPos)
        )
        Lists.range(0, 1 + Math.random() * 4).forEach(() =>
            DudeFactory.instance.new(DudeType.ORC_BRUTE, spawnPos)
        )
        Lists.range(0, 1 + Math.random() * 4).forEach(() =>
            DudeFactory.instance.new(DudeType.ORC_SHAMAN, spawnPos)
        )
    }

    private spawnWildlife() {
        const l = LocationManager.instance.currentLocation

        if (this.shouldRandomlySpawn(TimeUnit.DAY * 7)) {
            DudeFactory.instance.new(DudeType.BEAR, this.getSpawnPosOffMap())
        }

        if (this.shouldRandomlySpawn(TimeUnit.DAY * 3)) {
            const wolves = 2 + Math.random() * 4
            const spawnPos = this.getSpawnPosOffMap()
            for (let i = 0; i < wolves; i++) {
                DudeFactory.instance.new(DudeType.WOLF, spawnPos)
            }
        }
    }

    /**
     * @returns true if the creature should spawn based on randomness and averageMillisBetweenSpawns
     */
    private shouldRandomlySpawn(averageMillisBetweenSpawns: number) {
        const probability = 1 / (averageMillisBetweenSpawns / DudeSpawner.INTERVAL_MILLIS)
        console.log(`probability of spawning: ${probability}`)
        return Math.random() < probability
    }

    private getSpawnPosOffMap() {
        const extSize = LocationManager.instance.exterior().size
        const spawnSide = (((Math.random() > 0.5 ? 1 : -1) * extSize) / 2) * TILE_SIZE
        const spawnMiddle = Math.random() * extSize * TILE_SIZE - extSize / 2
        return Math.random() > 0.5
            ? new Point(spawnSide, spawnMiddle)
            : new Point(spawnMiddle, spawnSide)
    }
}
