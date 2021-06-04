import { debug } from "../engine/Debug"
import { CapturedInput, InputKey, InputKeyString } from "../engine/Input"
import { Point } from "../engine/Point"
import { Lists } from "../engine/util/Lists"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { pixelPtToTilePt, TILE_SIZE } from "./graphics/Tilesets"
import { NotificationDisplay } from "./ui/NotificationDisplay"
import { GroundType } from "./world/ground/Ground"
import { LocationManager } from "./world/LocationManager"
import { MapGenerator } from "./world/MapGenerator"
import { TimeUnit } from "./world/TimeUnit"
import { WorldTime } from "./world/WorldTime"

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    [InputKey.O, "spawn demon brute", (input) => DudeFactory.instance.new(DudeType.DEMON_BRUTE, input.mousePos)],
    [InputKey.P, "spawn small demon", (input) => DudeFactory.instance.new(DudeType.HORNED_DEMON, input.mousePos)],
    [InputKey.U, "spawn orc shaman", (input) => DudeFactory.instance.new(DudeType.ORC_SHAMAN, input.mousePos)],
    [InputKey.B, "spawn bear", (input) => DudeFactory.instance.new(DudeType.BEAR, input.mousePos)],
    [InputKey.SEMICOLON, "spawn shroom", (input) => DudeFactory.instance.new(DudeType.SHROOM, input.mousePos)],
    [InputKey.QUOTE, "trigger orc raid", (input) => {
        NotificationDisplay.instance.push({
            text: "ORC ATTACK!",
            icon: "sword",
        })
        Lists.range(0, 5 + Math.random() * 15).forEach(() => 
            DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE))
        )
        Lists.range(0, 1 + Math.random() * 4).forEach(() => 
            DudeFactory.instance.new(DudeType.ORC_BRUTE, new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE))
        )
    }],
    [InputKey.COMMA, "toggle ground path", (input) => {
        const mouseTilePos = pixelPtToTilePt(input.mousePos)
        if (LocationManager.instance.currentLocation.ground.get(mouseTilePos)?.type === GroundType.PATH) {
            LocationManager.instance.currentLocation.addGroundElement(GroundType.GRASS, mouseTilePos)
        } else {
            LocationManager.instance.currentLocation.addGroundElement(GroundType.PATH, mouseTilePos)
        }
    }],
    [InputKey.PERIOD, "delete hovered element", (input) => LocationManager.instance.currentLocation.removeElementAt(pixelPtToTilePt(input.mousePos))],
    [InputKey.N, "fast forward 1 hour", (input) => WorldTime.instance.fastForward(TimeUnit.HOUR)],
    [InputKey.M, "fast forward 1 minute", (input) => WorldTime.instance.fastForward(TimeUnit.MINUTE)],
]

export const DevControls = {
    checkDevControls: (input: CapturedInput) => {
        if (debug.enableDevControls) {
            devCommands.forEach(cmd => {
                if (input.isKeyDown(cmd[0])) {
                    cmd[2](input)
                }
            })
        }
    }
}

window["help"] = () => {
    let help = `dev controls (enable with debug.enableDevControls=true)
-------------------------------------------------------\n`
    devCommands.forEach(cmd => {
        help += `[${InputKeyString.for(cmd[0])}] ${cmd[1]}\n`
    })
    console.log(help)
}