import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { DarknessMask } from "../world/DarknessMask"
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
        WorldAudioContext.instance.isInBattle = 
                Array.from(LocationManager.instance.exterior().dudes.values())
                        .some(d => d.isAlive && d.factions.includes(DudeFaction.ORCS))
    }

    private spawn() {
        this.spawnDemons()
    }

    private spawnDemons() {
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY
        if (timeOfDay >= DarknessMask.SUNRISE_START && timeOfDay < DarknessMask.SUNSET_END) {
            return
        }

        const l = LocationManager.instance.currentLocation
        if (l.isInterior) {
            return  // don't spawn demons inside
        }
        const demons = Array.from(l.dudes.values()).filter(d => d.factions.includes(DudeFaction.DEMONS))
        if (demons.length > 0) {
            return  // just wait to spawn until all the demons have been killed
        }
        const goalDemonCount = Math.random() * 5

        if (demons.length < goalDemonCount) {
            const openPoints = l.getGroundSpots().filter(pt => 
                !l.isOccupied(pt) && LightManager.instance.isTotalDarkness(pt.times(TILE_SIZE)))

            for (let i = 0; i < Math.min(openPoints.length, goalDemonCount - demons.length); i++) {
                const pt = Lists.oneOf(openPoints)
                const type = Math.random() > .95 ? DudeType.DEMON_BRUTE : DudeType.HORNED_DEMON
                DudeFactory.instance.new(type, pt.times(TILE_SIZE), l)
            }
        }
    }

    spawnOrcs() {
        setTimeout(() => NotificationDisplay.instance.push({
            text: "ORC ATTACK!",
            icon: "sword",
        }), 6500)
        const extSize = LocationManager.instance.exterior().size
        const spawnSide = (Math.random() > .5 ? 1 : -1) * extSize/2 * TILE_SIZE
        const spawnMiddle = Math.random() * extSize * TILE_SIZE - extSize/2
        const spawnPos = Math.random() > .5 ? new Point(spawnSide, spawnMiddle) : new Point(spawnMiddle, spawnSide)
        console.log(spawnPos)
        Lists.range(0, 5 + Math.random() * 10).forEach(() => DudeFactory.instance.new(DudeType.ORC_WARRIOR, spawnPos))
        Lists.range(0, 1 + Math.random() * 4).forEach(() => DudeFactory.instance.new(DudeType.ORC_BRUTE, spawnPos))
        Lists.range(0, 1 + Math.random() * 4).forEach(() => DudeFactory.instance.new(DudeType.ORC_SHAMAN, spawnPos))
    }

    getEntity() {
        return new Entity([this])
    }
}