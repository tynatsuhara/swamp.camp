import { Entity } from "../../engine/Entity"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { EventQueue } from "./events/EventQueue"
import { InputKey } from "../../engine/input"

export class WorldTime extends Component {

    static instance: WorldTime
    static readonly MINUTE = 1500  // millis in an in-game minute
    static readonly HOUR = 60 * WorldTime.MINUTE
    static readonly DAY = 24 * WorldTime.HOUR

    private _time: number = 0  // millis
    get time() { return this._time }

    constructor(time: number = 0) {
        super()
        WorldTime.instance = this
        this._time = time
    }

    update(updateData: UpdateData) {
        this._time += updateData.elapsedTimeMillis

        // TODO cleanup
        if (updateData.input.isKeyDown(InputKey.N) || updateData.input.isKeyDown(InputKey.M)) {
            this._time += updateData.input.isKeyDown(InputKey.N) ? WorldTime.HOUR : WorldTime.MINUTE
            console.log(`fast forwarding time to ${this.clockTime()}`)
        }

        EventQueue.instance.processEvents(this.time)

        window.document.title = `wow a game | ${this.clockTime()}`
    }

    getEntity(): Entity {
        return new Entity([this])
    }

    future({ minutes = 0, hours = 0, days = 0 }) {
        return this.time + (minutes * WorldTime.MINUTE) + (hours * WorldTime.HOUR) + (days * WorldTime.DAY)
    }

    private clockTime() {
        const hour = Math.floor(this.time % WorldTime.DAY/WorldTime.HOUR)
        const minute = Math.floor(this.time % WorldTime.HOUR/WorldTime.MINUTE)
        return `${hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)}:${(minute < 10 ? "0" : "")}${minute} ${hour < 12 ? "AM" : "PM"}`
    }
}