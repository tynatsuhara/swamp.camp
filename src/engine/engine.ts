import { Renderer } from "./renderer"
import { Input, CapturedInput } from "./input"
import { Game } from "./game"
import { Point } from "./point"

export class UpdateViewsContext {  
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}

export class StartData {
    
}

export class UpdateData {
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

        setInterval(() => this.tick(), 1/60)
    }

    tick() {
        const time = new Date().getTime()
        const elapsed = time - this.lastUpdateMillis

        if (elapsed == 0) {
            return
        }
    
        const updateViewsContext: UpdateViewsContext = {
            elapsedTimeMillis: elapsed,
            input: this.input.captureInput(),
            dimensions: this.renderer.getDimensions()
        }

        const views = this.game.getViews(updateViewsContext)

        views.forEach(v => {
            const updateData: UpdateData = {
                elapsedTimeMillis: updateViewsContext.elapsedTimeMillis,
                input: updateViewsContext.input.scaled(v.zoom),
                dimensions: updateViewsContext.dimensions.div(v.zoom)
            }
            // TODO: consider the behavior where an entity belongs to multiple views (eg splitscreen)
            v.entities.forEach(e => e.components.forEach(c => {
                if (c.start !== ALREADY_STARTED_COMPONENT) {
                    c.start({})
                    c.start = ALREADY_STARTED_COMPONENT
                }
                c.update(updateData) 
            }))
        })

        this.renderer.render(views)
        
        this.lastUpdateMillis = time
    }
}

const ALREADY_STARTED_COMPONENT = (startData: StartData) => {
    throw new Error("start() has already been called on this component")
}