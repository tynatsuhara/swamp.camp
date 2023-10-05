import { Component, debug, Entity, pt } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { saveManager } from "../core/SaveManager"
import { Singletons } from "../core/Singletons"
import { TILE_SIZE } from "../graphics/Tilesets"
import { session } from "../online/session"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { tilesAround } from "../utils/misc"
import { DarknessMask } from "../world/DarknessMask"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { setGameTimeout } from "../world/events/setGameTimeout"
import { Ground } from "../world/ground/Ground"
import { LightManager } from "../world/LightManager"
import { EAST_COAST_OCEAN_WIDTH } from "../world/locations/CampLocationGenerator"
import { camp } from "../world/locations/LocationManager"
import { TimeUnit } from "../world/TimeUnit"
import { now, WorldTime } from "../world/WorldTime"
import { DudeFaction, DudeFactory } from "./DudeFactory"
import { DudeType } from "./DudeType"
import { NPC } from "./NPC"
import { Visitor } from "./types/Visitor"

export class DudeSpawner extends Component {
    static get instance() {
        return Singletons.getOrCreate(DudeSpawner)
    }

    private static readonly INTERVAL_MILLIS = 30_000
    private nextUpdate = now()

    update() {
        if (now() > this.nextUpdate) {
            this.spawn()
            this.nextUpdate = now() + DudeSpawner.INTERVAL_MILLIS
        }

        // Maybe consider moving this code elsewhere later
        WorldAudioContext.instance.isInBattle = camp()
            .getDudes()
            .some((d) => d.isAlive && d.factions.includes(DudeFaction.ORCS))
    }

    getEntity() {
        return new Entity([this])
    }

    private spawn() {
        if (!saveManager.getState() || !saveManager.getState().hasMadeFire || session.isGuest()) {
            return
        }

        if (!debug.peacefulMode) {
            this.spawnDemons()
            this.spawnSwampThings()
            this.checkForOrcSeige()
            this.spawnWildlife()
        }

        // TODO: Re-enable once visitors are ready to go
        // this.spawnVisitors()
    }

    // TODO spawn organically
    spawnVisitors(forceSpawn = false) {
        const visitorTypes = [DudeType.SPOOKY_VISITOR]

        const currentVisitors = camp()
            .getDudes()
            .filter((d) => visitorTypes.includes(d.type))

        if (currentVisitors.length > 0) {
            return
        }

        if (forceSpawn || this.shouldRandomlySpawn(TimeUnit.DAY * 7)) {
            const visitorType = Lists.oneOf(visitorTypes)

            console.log(`spawning villager ${visitorTypes}`)

            const dude = DudeFactory.instance.create(
                visitorType,
                this.getSpawnPosOutsideOfLocation()
            )
            dude.entity.getComponent(Visitor)?.welcome()
        }
    }

    private spawnDemons() {
        const timeOfDay = now() % TimeUnit.DAY
        if (timeOfDay >= DarknessMask.SUNRISE_START && timeOfDay < DarknessMask.SUNSET_END) {
            return
        }

        const l = camp()

        const demons = l.getDudes().filter((d) => d.factions.includes(DudeFaction.DEMONS))
        const goalDemonCount = Math.random() * 5 - demons.length

        if (demons.length < goalDemonCount) {
            const openPoints = l
                .getWalkableGroundSpots()
                .filter(
                    (pt) =>
                        !l.isOccupied(pt) &&
                        LightManager.instance.isTotalDarkness(pt.times(TILE_SIZE))
                )

            for (let i = 0; i < Math.min(openPoints.length, goalDemonCount - demons.length); i++) {
                const pt = Lists.oneOf(openPoints)
                const type = Math.random() > 0.95 ? DudeType.DEMON_BRUTE : DudeType.HORNED_DEMON
                DudeFactory.instance.create(type, pt.times(TILE_SIZE), l)
            }
        }
    }

    private spawnSwampThings() {
        const l = camp()

        const thingCount = l.getDudes().filter((d) => d.type === DudeType.SWAMP_THING)

        const waterSpots = l.getAllGroundSpots().filter(
            (p) => Ground.isWater(l, p) && p.x < camp().size / 2 - EAST_COAST_OCEAN_WIDTH // not in the ocean
        )

        const goalCount = waterSpots.length / 50

        // TODO: Some unlockable way to make swamp things not spawn?

        if (thingCount.length < goalCount) {
            const spawnCount = Math.min(waterSpots.length, goalCount - thingCount.length)
            for (let i = 0; i < spawnCount; i++) {
                const pt = Lists.oneOf(waterSpots)
                DudeFactory.instance.create(DudeType.SWAMP_THING, pt.times(TILE_SIZE), l)
            }
        }
    }

    private checkForOrcSeige() {
        if (!EventQueue.instance.containsEventType(QueuedEventType.ORC_SEIGE)) {
            // orc siege should happen sometime during the day
            let nextSeigeTime = WorldTime.instance.future({ days: 2 + Math.random() * 3 })
            nextSeigeTime -= nextSeigeTime % TimeUnit.DAY
            nextSeigeTime += TimeUnit.HOUR * (6 + Math.random() * 13)
            nextSeigeTime += TimeUnit.MINUTE * Math.random() * 60
            console.log(`next orc siege time: ${WorldTime.clockTime(nextSeigeTime)}`)

            EventQueue.instance.addEvent({
                type: QueuedEventType.ORC_SEIGE,
                time: nextSeigeTime,
            })
        }
    }

    spawnOrcs() {
        if (debug.peacefulMode) {
            console.log("peaceful mode enabled — no orcs will spawn")
            return
        }

        const spawnPos = this.getSpawnPosOutsideOfLocation()

        // TODO: Make these values dynamic based on progress
        const leaderCount = 1
        const warriorCount = 2 + Math.random() * 3
        const shamanCount = 1

        const spawn = (type: DudeType) => DudeFactory.instance.create(type, spawnPos)

        const leaders = Lists.range(0, leaderCount).map(() => spawn(DudeType.ORC_BRUTE))
        const followers = [
            ...Lists.range(0, warriorCount).map(() => spawn(DudeType.ORC_WARRIOR)),
            ...Lists.range(0, shamanCount).map(() => spawn(DudeType.ORC_SHAMAN)),
        ]

        followers.forEach((f) => f.entity.getComponent(NPC).setLeader(Lists.oneOf(leaders)))

        const orcs = [...leaders, ...followers]

        setGameTimeout(
            () =>
                NotificationDisplay.instance.push({
                    text: "Orc siege!",
                    icon: "sword",
                    isExpired: () => orcs.every((orc) => !orc.isAlive || !orc.entity),
                }),
            6500
        )
    }

    private spawnWildlife() {
        if (this.shouldRandomlySpawn(TimeUnit.DAY * 7)) {
            DudeFactory.instance.create(DudeType.BEAR, this.getSpawnPosOutsideOfLocation())
        }

        if (this.shouldRandomlySpawn(TimeUnit.DAY * 3)) {
            this.spawnWolves()
        }
    }

    spawnWolves() {
        const leaderSpawnPos = this.getSpawnPosOutsideOfLocation()
        const leader = DudeFactory.instance.create(DudeType.WOLF, leaderSpawnPos)

        const spawnPoints = tilesAround(leaderSpawnPos, 3)
        const wolves = Math.floor(1 + Math.random() * 4)
        console.log(`spawning ${wolves + 1} wolves`)
        for (let i = 0; i < wolves; i++) {
            const wolf = DudeFactory.instance.create(DudeType.WOLF, Lists.oneOf(spawnPoints))
            wolf.entity.getComponent(NPC).setLeader(leader)
        }
    }

    /**
     * @returns true if the creature should spawn based on randomness and averageMillisBetweenSpawns
     */
    private shouldRandomlySpawn(averageMillisBetweenSpawns: number) {
        const probability = 1 / (averageMillisBetweenSpawns / DudeSpawner.INTERVAL_MILLIS)
        return Math.random() < probability
    }

    /**
     * @returns A pixel coordinate (not point)
     */
    getSpawnPosOutsideOfLocation(l = camp(), excludeSides: Side[] = []) {
        // distance from (0, 0)
        const distance = (l.range + 2) * TILE_SIZE

        const posOnSideLeftRight = (-l.range + Math.random() * l.size) * TILE_SIZE
        // (assuming all locations are square)
        const posOnSideTopBottom =
            l === camp()
                ? // don't stick em in the ocean
                  (-l.range + Math.random() * (l.size - EAST_COAST_OCEAN_WIDTH)) * TILE_SIZE
                : posOnSideLeftRight

        const options = {
            left: pt(-distance, posOnSideLeftRight),
            right: pt(distance, posOnSideLeftRight),
            top: pt(posOnSideTopBottom, -distance),
            bottom: pt(posOnSideTopBottom, distance),
        }

        // camp() doesn't permit right side entry since it's the ocean
        if (l === camp()) {
            delete options.right
        }

        excludeSides.forEach((s) => delete options[s])

        return Lists.oneOf(Object.values(options))
    }
}

type Side = "left" | "right" | "top" | "bottom"
