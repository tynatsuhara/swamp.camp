import { Renderer } from "./renderer/Renderer"
import { Input, CapturedInput } from "./input"
import { Game } from "./game"
import { Point } from "./point"
import { View } from "./View"
import { profiler, measure } from "./profiler"
import { debug } from "./debug"
import { assets } from "./Assets"
import { CollisionEngine } from "./collision/CollisionEngine"

export class UpdateViewsContext {
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}

export class StartData {
    
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
        const elapsed = time - this.lastUpdateMillis

        if (elapsed == 0) {
            return
        }

        CollisionEngine.instance.nextUpdate()
    
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

                const startData: StartData = {}
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
                    if (c.start !== ALREADY_STARTED_COMPONENT) {
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

        if (debug.showProfiler) {
            profiler.update(elapsed, updateDuration, renderDuration, componentsUpdated)
        }
        
        this.lastUpdateMillis = time

        requestAnimationFrame(() => this.tick())
    }

    private getViews(context: UpdateViewsContext): View[] {
        return this.game.getViews(context).concat(debug.showProfiler ? [profiler.getView()] : [])
    }
}

const ALREADY_STARTED_COMPONENT = (startData: StartData) => {
    throw new Error("start() has already been called on this component")
}