import { BinaryHeap } from "brigsby/dist/util/BinaryHeap"
import { Singletons } from "../../Singletons"
import { WorldTime } from "../WorldTime"
import { QueuedEventData, EVENT_QUEUE_HANDLERS, QueuedEventType } from "./QueuedEvent"

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
    }

    addEvent(event: QueuedEventData) {
        this.heap.push(event)
    }

    processEvents(currentTime: number) {
        while (this.heap.size() > 0 && this.heap.peek().time <= currentTime) {
            const event = this.heap.pop()
            EVENT_QUEUE_HANDLERS[event.type](event)
        }
    }

    save() {
        return this.heap.getContents()
    }

    private containsEventType(type: QueuedEventType) {
        return this.heap.getContents().some((data) => data.type === type)
    }
}
