import { Tile, Entity, Player } from "./entity"
import { Renderer } from "./renderer";
import { Point } from "./util";
import { Input, InputKey } from "./input";
import { Game } from "./game";

const RENDERER = new Renderer()
const INPUT = new Input()
const GAME = new Game()

let currentSessionTicks = 0
    
function tick() {
    const input = INPUT.captureInput()
    const entities = GAME.getEntities()

    entities.forEach(tile => tile.update(input))
    RENDERER.render(entities)
    
    currentSessionTicks++
}

setInterval(tick, 1/60);
