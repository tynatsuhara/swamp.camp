import { Tile, Entity, Player } from "./entity"
import { Renderer } from "./renderer";
import { Point } from "./util";
import { Input, InputKey, CapturedInput } from "./input";
import { Game } from "./game";

export class UpdateData {
    readonly currentSessionTicks: number
    readonly elapsedTimeMillis: number
    readonly input: CapturedInput
    readonly dimensions: Point
}
    
class Engine {
    private readonly renderer = new Renderer()
    private readonly input = new Input()
    private readonly game = new Game()

    private currentSessionTicks: number
    private lastUpdateMillis = new Date().getTime()

    constructor() {
        setInterval(() => this.tick(), 1/60);
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

        const worldEntities = this.game.getWorldEntities()
        const uiEntities = this.game.getUIEntities(updateData)
    
        worldEntities.forEach(tile => tile.update(updateData))
        this.renderer.render(worldEntities, uiEntities)
        
        this.currentSessionTicks++
        this.lastUpdateMillis = time
    }
}

new Engine()
