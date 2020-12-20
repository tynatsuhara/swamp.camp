import { Entity } from "../../engine/Entity"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { EventQueue } from "./events/EventQueue"
import { InputKey } from "../../engine/input"
import { TimeUnit } from "./TimeUnit"

export class WorldTime extends Component {

    static instance: WorldTime

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
            this._time += updateData.input.isKeyDown(InputKey.N) ? TimeUnit.HOUR : TimeUnit.MINUTE
            console.log(`fast forwarding time to ${this.clockTime()}`)
        }

        EventQueue.instance.processEvents(this.time)

        window.document.title = `wow a game | ${this.clockTime()}`
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