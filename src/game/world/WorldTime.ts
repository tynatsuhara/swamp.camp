import { Entity } from "../../engine/Entity"
import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { EventQueue } from "./events/EventQueue"
import { TimeUnit } from "./TimeUnit"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { saveManager } from "../SaveManager"

export class WorldTime extends Component {

    private static _instance: WorldTime
    static get instance(): WorldTime {
        if (!this._instance) {
            this._instance = new WorldTime()
        }
        return this._instance
    }

    private _time: number = 0  // millis
    get time() { return this._time }

    private title = window.document.title

    private constructor() {
        super()
        WorldTime._instance = this
    }

    initialize(time: number) {
        this._time = time
    }

    update(updateData: UpdateData) {
        this._time += updateData.elapsedTimeMillis
        saveManager.setState({ 
            timePlayed: (saveManager.getState().timePlayed || 0) + updateData.elapsedTimeMillis
        })

        EventQueue.instance.processEvents(this.time)
        WorldAudioContext.instance.time = this.time

        window.document.title = `${this.title} | ${this.clockTime()}`
    }

    fastForward(duration: number) {
        this._time += duration
        console.log(`fast forwarding time to ${this.clockTime()}`)
    }

    getEntity(): Entity {
        return new Entity([this])
    }

    future({ minutes = 0, hours = 0, days = 0 }) {
        return this.time + (minutes * TimeUnit.MINUTE) + (hours * TimeUnit.HOUR) + (days * TimeUnit.DAY)
    }

    private clockTime() {
        const hour = Math.floor(this.time % TimeUnit.DAY/TimeUnit.HOUR)
        const minute = Math.floor(this.time % TimeUnit.HOUR/TimeUnit.MINUTE)
        return `${hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)}:${(minute < 10 ? "0" : "")}${minute} ${hour < 12 ? "AM" : "PM"}`
    }
}