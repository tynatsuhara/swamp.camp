import { Renderer } from "./renderer"
import { Input, CapturedInput } from "./input"
import { Game } from "./game";
import { Point } from "./point";

export class UpdateData {
    readonly currentSessionTicks: number
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}

export class Engine {
    private readonly input = new Input()
    private readonly game: Game
    private readonly renderer: Renderer

    private currentSessionTicks: number
    private lastUpdateMillis = new Date().getTime()

    constructor(game: Game, canvas: HTMLCanvasElement) {
        this.game = game
        this.renderer = new Renderer(canvas)

        setInterval(() => this.tick(), 1/60)
    }

    tick() {
        const time = new Date().getTime()
        const elapsed = time - this.lastUpdateMillis

        if (elapsed == 0) {
            return
        }
    
        const updateData: UpdateData = {
            currentSessionTicks: this.currentSessionTicks,
            elapsedTimeMillis: elapsed,
            input: this.input.captureInput(),
            dimensions: this.renderer.getDimensions()
        }

        const views = this.game.getViews(updateData)

        views.forEach(v => v.entities.forEach(e => e.update(updateData)))
        this.renderer.render(views)
        
        this.currentSessionTicks++
        this.lastUpdateMillis = time
    }
}