import { View } from "./View"
import { Entity } from "./Entity"
import { TextRenderComponent } from "./renderer/TextRender"
import { Point } from "./point"

class Profiler {
    private start: number = new Date().getTime()
    private fpsTracker = new MovingAverage()
    private updateTracker = new MovingAverage()
    private renderTracker = new MovingAverage()

    update(
        msSinceLastUpdate: number, 
        msForUpdate: number,
        msForRender: number
    ) {
        this.fpsTracker.record(msSinceLastUpdate)
        this.updateTracker.record(msForUpdate)
        this.renderTracker.record(msForRender)
    }

    getView(): View {
        const s = [
            `FPS: ${round(1000/this.fpsTracker.get())} (${round(this.fpsTracker.get())} ms per frame)`,
            `update() duration ms: ${round(this.updateTracker.get(), 2)}`,
            `render() duration ms: ${round(this.renderTracker.get(), 2)}`
        ]
        return new View([
            new Entity(s.map((str, i) => new TextRenderComponent(str, new Point(60, 70 + 25 * i))))
        ])
    }
}

const round = (val, pow=0) => {
    const decimals = Math.pow(10, pow)
    return Math.round(val * decimals)/decimals
}

class MovingAverage {
    pts: [number, number][] = []
    sum = 0
    lifetime = 1  // in seconds

    record(val: number) {
        const now = new Date().getTime()
        const expireThreshold = now - 1000 * this.lifetime
        while (this.pts.length > 0 && this.pts[0][0] < expireThreshold) {
            const old = this.pts.shift()
            this.sum -= old[1]
        }
        this.pts.push([now, val])
        this.sum += val
    }

    get(): number {
        return this.sum/this.pts.length
    }
}

export const profiler = new Profiler()

/**
 * Executes the given function and returns the duration it took to execute as well as the result
 */
export function measure<T>(fn: () => T): [number, T] {
    const start = new Date().getTime()
    const result = fn()
    return [new Date().getTime() - start, result]
}