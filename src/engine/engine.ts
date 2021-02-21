import { collisionEngine } from "./collision/CollisionEngine"
import { ALREADY_STARTED_COMPONENT } from "./component"
import { debug } from "./debug"
import { Game } from "./game"
import { CapturedInput, Input } from "./input"
import { Point } from "./point"
import { measure, profiler } from "./profiler"
import { Renderer } from "./renderer/Renderer"
import { View } from "./View"

const MINIMUM_ALLOWED_FPS = 15
const MAX_ELAPSED_MILLIS = 1000/MINIMUM_ALLOWED_FPS

export class UpdateViewsContext {
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}

export class AwakeData {}
export class StartData {
    readonly dimensions: Point
}
export class UpdateData {
    readonly view: View
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}

export class Engine {
    private readonly game: Game
    private readonly renderer: Renderer
    private readonly input: Input

    private lastUpdateMillis = new Date().getTime()

    constructor(game: Game, canvas: HTMLCanvasElement) {
        this.game = game
        this.renderer = new Renderer(canvas)
        this.input = new Input(canvas)
        
        this.game.initialize()
        requestAnimationFrame(() => this.tick())
    }

    tick() {
        const time = new Date().getTime()

        // Because of JS being suspended in the background, elapsed may become 
        // really high, so we need to limit it with MAX_ELAPSED_MILLIS.
        // This means that visual lag can happen if fps < MINIMUM_ALLOWED_FPS
        const elapsed = Math.min(time - this.lastUpdateMillis, MAX_ELAPSED_MILLIS)

        if (elapsed == 0) {
            return
        }

        collisionEngine.nextUpdate()
    
        const updateViewsContext: UpdateViewsContext = {
            elapsedTimeMillis: elapsed,
            input: this.input.captureInput(),
            dimensions: this.renderer.getDimensions()
        }

        const views = this.getViews(updateViewsContext)

        let componentsUpdated = 0

        const [updateDuration] = measure(() => {            
            views.forEach(v => {
                v.entities = v.entities.filter(e => !!e)

                const startData: StartData = {
                    dimensions: updateViewsContext.dimensions.div(v.zoom)
                }
                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                    input: updateViewsContext.input.scaledForView(v),
                    dimensions: updateViewsContext.dimensions.div(v.zoom)
                }
                // Behavior where an entity belongs to multiple views is undefined (revisit later, eg for splitscreen)
                v.entities.forEach(e => e.components.forEach(c => {
                    if (!c.enabled) {
                        return
                    }
                    if (!c.isStarted) {
                        c.start(startData)
                        c.start = ALREADY_STARTED_COMPONENT
                    }
                    c.update(updateData) 
                    componentsUpdated++
                }))
            })
        })

        const [renderDuration] = measure(() => {
            this.renderer.render(views)
        })

        const [lateUpdateDuration] = measure(() => {
            views.forEach(v => {
                const updateData: UpdateData = {
                    view: v,
                    elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                    input: updateViewsContext.input.scaledForView(v),
                    dimensions: updateViewsContext.dimensions.div(v.zoom)
                }
                v.entities.forEach(e => e.components.forEach(c => {
                    c.lateUpdate(updateData)
                }))
            })
        })

        if (debug.showProfiler) {
            profiler.updateEngineTickStats(elapsed, updateDuration, renderDuration, lateUpdateDuration, componentsUpdated)
        }
        
        this.lastUpdateMillis = time

        requestAnimationFrame(() => this.tick())
    }

    private getViews(context: UpdateViewsContext): View[] {
        return this.game.getViews(context).concat(debug.showProfiler ? [profiler.getView()] : [])
    }
}
