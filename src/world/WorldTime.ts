import { Component, Entity, UpdateData } from "brigsby/dist"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { isGamePaused } from "../core/PauseState"
import { saveManager } from "../core/SaveManager"
import { Singletons } from "../core/Singletons"
import { syncFn } from "../online/syncUtils"
import { Day, TimeUnit } from "./TimeUnit"
import { EventQueue } from "./events/EventQueue"
import { TimeoutQueue } from "./events/TimeoutQueue"
import { LocationManager } from "./locations/LocationManager"

export class WorldTime extends Component {
    static get instance() {
        return Singletons.getOrCreate(WorldTime)
    }

    // TODO add a now() utility
    private _time: number = 0 // millis
    get time() {
        return this._time
    }

    get currentDay(): Day {
        return Math.floor((this.time % (TimeUnit.DAY * 7)) / TimeUnit.DAY)
    }
    // 0-23
    get currentHour(): number {
        return Math.floor((this.time % TimeUnit.DAY) / TimeUnit.HOUR)
    }

    initialize(time: number) {
        this._time = time
    }

    update(updateData: UpdateData) {
        saveManager.setState({
            timePlayed: (saveManager.getState().timePlayed || 0) + updateData.elapsedTimeMillis,
        })

        if (!isGamePaused()) {
            this._time += updateData.elapsedTimeMillis
            EventQueue.instance.processEvents(this.time)
            TimeoutQueue.instance.processEvents(this.time)
            WorldAudioContext.instance.time = this.time
        }
    }

    fastForward = syncFn("wt:ff", (duration: number) => {
        this._time += duration
        console.log(`fast forwarding time to ${WorldTime.clockTime()}`)

        LocationManager.instance.simulateLocations(true, duration)
    })

    getEntity(): Entity {
        return new Entity([this])
    }

    future({ minutes = 0, hours = 0, days = 0 }) {
        return this.time + minutes * TimeUnit.MINUTE + hours * TimeUnit.HOUR + days * TimeUnit.DAY
    }

    tomorrow(timeOfDay: number = 0) {
        return Math.floor(this.time / TimeUnit.DAY) * TimeUnit.DAY + TimeUnit.DAY + timeOfDay
    }

    static clockTime(time: number = now()) {
        const hour = Math.floor((time % TimeUnit.DAY) / TimeUnit.HOUR)
        const minute = Math.floor((time % TimeUnit.HOUR) / TimeUnit.MINUTE)
        return `${hour == 0 ? 12 : hour > 12 ? hour - 12 : hour}:${
            minute < 10 ? "0" : ""
        }${minute} ${hour < 12 ? "AM" : "PM"}`
    }
}

/**
 * @returns the current game time, in milliseconds
 */
export const now = () => WorldTime.instance.time
