import { BinaryHeap } from "../../../engine/util/BinaryHeap"
import { QueuedEventData, EVENT_QUEUE_HANDLERS } from "./QueuedEvent"

export class EventQueue {

    private static _instance: EventQueue
    static get instance(): EventQueue {
        if (!this._instance) {
            this._instance = new EventQueue()
        }
        return this._instance
    }

    private heap: BinaryHeap<QueuedEventData> = new BinaryHeap(e => e.time)

    initialize(data: QueuedEventData[] = []) {
        this.heap.clear()
        this.heap.pushAll(data)
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
}