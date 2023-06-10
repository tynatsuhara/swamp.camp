import { expose } from "brigsby/dist/Debug"
import { BinaryHeap } from "brigsby/dist/util"
import { Singletons } from "../../core/Singletons"
import { session } from "../../online/session"
import { WorldTime } from "../WorldTime"
import { getEventQueueHandlers, QueuedEventData, QueuedEventType } from "./QueuedEvent"

export class EventQueue {
    static get instance() {
        return Singletons.getOrCreate(EventQueue)
    }

    private heap: BinaryHeap<QueuedEventData> = new BinaryHeap((e) => e.time)

    initialize(data: QueuedEventData[] = []) {
        this.heap.clear()
        this.heap.pushAll(data)

        // there are some event types that should always be in the queue
        if (!this.containsEventType(QueuedEventType.DAILY_SCHEDULE)) {
            this.heap.push({
                type: QueuedEventType.DAILY_SCHEDULE,
                time: WorldTime.instance.tomorrow(),
            })
        }

        expose({
            eventQueue: () =>
                console.log(
                    EventQueue.instance.heap.getContents(true).map((data) => ({
                        ...data,
                        type: QueuedEventType[data.type], // print a human-readable type
                        clockTime: WorldTime.clockTime(data.time),
                    }))
                ),
        })
    }

    addEvent(event: QueuedEventData) {
        this.heap.push(event)
    }

    processEvents(currentTime: number) {
        if (session.isGuest()) {
            return
        }
        while (this.heap.size() > 0 && this.heap.peek().time <= currentTime) {
            const event = this.heap.pop()
            getEventQueueHandlers()[event.type](event)
        }
    }

    save() {
        return this.heap.getContents()
    }

    containsEventType(type: QueuedEventType) {
        return this.heap.getContents().some((data) => data.type === type)
    }
}
