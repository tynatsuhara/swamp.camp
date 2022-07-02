import { Component, Entity, UpdateData } from "brigsby/lib"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { saveManager } from "../SaveManager"
import { Singletons } from "../Singletons"
import { EventQueue } from "./events/EventQueue"
import { LocationManager } from "./LocationManager"
import { Day, TimeUnit } from "./TimeUnit"

export class WorldTime extends Component {
    static get instance() {
        return Singletons.getOrCreate(WorldTime)
    }

    private _time: number = 0 // millis
    get time() {
        return this._time
    }

    get currentDay(): Day {
        return Math.floor((WorldTime.instance.time % (TimeUnit.DAY * 7)) / TimeUnit.DAY)
    }

    initialize(time: number) {
        this._time = time
    }

    update(updateData: UpdateData) {
        this._time += updateData.elapsedTimeMillis
        saveManager.setState({
            timePlayed: (saveManager.getState().timePlayed || 0) + updateData.elapsedTimeMillis,
        })

        EventQueue.instance.processEvents(this.time)
        WorldAudioContext.instance.time = this.time

        window.document.title = `SWAMP CAMP | ${WorldTime.clockTime()}`
    }

    fastForward(duration: number) {
        this._time += duration
        console.log(`fast forwarding time to ${WorldTime.clockTime()}`)

        LocationManager.instance.simulateLocations(true, duration)
    }

    getEntity(): Entity {
        return new Entity([this])
    }

    future({ minutes = 0, hours = 0, days = 0 }) {
        return this.time + minutes * TimeUnit.MINUTE + hours * TimeUnit.HOUR + days * TimeUnit.DAY
    }

    tomorrow(timeOfDay: number = 0) {
        return Math.floor(this.time / TimeUnit.DAY) * TimeUnit.DAY + TimeUnit.DAY + timeOfDay
    }

    static clockTime(time: number = WorldTime.instance.time) {
        const hour = Math.floor((time % TimeUnit.DAY) / TimeUnit.HOUR)
        const minute = Math.floor((time % TimeUnit.HOUR) / TimeUnit.MINUTE)
        return `${hour == 0 ? 12 : hour > 12 ? hour - 12 : hour}:${
            minute < 10 ? "0" : ""
        }${minute} ${hour < 12 ? "AM" : "PM"}`
    }
}
