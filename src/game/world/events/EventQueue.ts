import { BinaryHeap } from "../../../engine/util/BinaryHeap"
import { QueuedEventData, EVENT_QUEUE_HANDLERS } from "./QueuedEvent"

export class EventQueue {

    static instance: EventQueue

    private heap: BinaryHeap<QueuedEventData> = new BinaryHeap(e => e.time)

    constructor() {
        EventQueue.instance = this
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
}