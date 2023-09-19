import { BinaryHeap } from "brigsby/dist/util"
import { Singletons } from "../../core/Singletons"
import { EventDispatcher } from "../../utils/EventDispatcher"
import { now } from "../WorldTime"

/**
 * This class handles events as a drop-in replacement for setTimeout (setGameTimeout).
 * It runs on both hosts and clients!
 */
export class TimeoutQueue {
    static get instance() {
        return Singletons.getOrCreate(TimeoutQueue)
    }

    private heap: BinaryHeap<{ time: number; fn: () => void }> = new BinaryHeap((e) => e.time)

    constructor() {
        EventDispatcher.instance.listen(
            "gametimeout",
            ({ fn, delay }: { fn: () => void; delay: number }) => {
                this.addEvent({
                    time: now() + delay,
                    fn,
                })
            }
        )
    }

    addEvent(event: { time: number; fn: () => void }) {
        this.heap.push(event)
    }

    processEvents(currentTime: number) {
        while (this.heap.size() > 0 && this.heap.peek().time <= currentTime) {
            const { fn } = this.heap.pop()
            fn()
        }
    }
}
