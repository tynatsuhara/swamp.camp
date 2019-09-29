import { QuestGame } from "./game/quest_game"
import { Engine } from "./engine/engine"

new Engine(
    new QuestGame(),
    <HTMLCanvasElement>document.getElementById('canvas')
)
