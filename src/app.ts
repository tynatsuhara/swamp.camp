import { game } from "./game/quest_game"
import { Engine } from "./engine/engine"

new Engine(game, <HTMLCanvasElement>document.getElementById('canvas'))
