import { View } from "./view"
import { Entity } from "./entity"
import { TextRenderComponent } from "./renderer/TextRender"
import { Point } from "./point"

class Profiler {
    private start: number = new Date().getTime()
    private lastElapsedTimeMillis: number = 0
    private fpsTracker = new MovingAverage()

    update(elapsedTimeMillis: number) {
        this.lastElapsedTimeMillis = elapsedTimeMillis
        this.fpsTracker.record(elapsedTimeMillis)
    }

    getView(): View {
        return new View([
            new Entity([new TextRenderComponent("FPS: " + Math.round(1000/this.fpsTracker.get()), new Point(70, 70))])
        ])
    }
}

class MovingAverage {
    pts: [number, number][] = []
    sum = 0
    lifetime = 10

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