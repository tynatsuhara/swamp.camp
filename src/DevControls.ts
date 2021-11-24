import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { CapturedInput, InputKey, InputKeyString } from "brigsby/dist/Input"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { DudeSpawner } from "./characters/DudeSpawner"
import { pixelPtToTilePt } from "./graphics/Tilesets"
import { GroundType } from "./world/ground/Ground"
import { LocationManager } from "./world/LocationManager"
import { TimeUnit } from "./world/TimeUnit"
import { WorldTime } from "./world/WorldTime"

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    [
        InputKey.O,
        "spawn swampy",
        (input) => DudeFactory.instance.new(DudeType.SWAMP_THING, input.mousePos),
    ],
    [
        InputKey.P,
        "spawn small demon",
        (input) => DudeFactory.instance.new(DudeType.HORNED_DEMON, input.mousePos),
    ],
    [
        InputKey.U,
        "spawn orc shaman",
        (input) => DudeFactory.instance.new(DudeType.ORC_SHAMAN, input.mousePos),
    ],
    [InputKey.B, "spawn bear", (input) => DudeFactory.instance.new(DudeType.BEAR, input.mousePos)],
    [InputKey.V, "spawn wolf", (input) => DudeFactory.instance.new(DudeType.WOLF, input.mousePos)],
    [
        InputKey.SEMICOLON,
        "spawn shroom",
        (input) => DudeFactory.instance.new(DudeType.SHROOM, input.mousePos),
    ],
    [InputKey.QUOTE, "trigger orc raid", () => DudeSpawner.instance.spawnOrcs()],
    [
        InputKey.COMMA,
        "toggle ground path",
        (input) => {
            const mouseTilePos = pixelPtToTilePt(input.mousePos)
            const currentType =
                LocationManager.instance.currentLocation.getGround(mouseTilePos)?.type
            if (currentType === GroundType.PATH) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.GRASS,
                    mouseTilePos
                )
            } else if (currentType === GroundType.GRASS) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.PATH,
                    mouseTilePos
                )
            }
        },
    ],
    [
        InputKey.L,
        "place water",
        (input) => {
            const mouseTilePos = pixelPtToTilePt(input.mousePos)
            const currentType =
                LocationManager.instance.currentLocation.getGround(mouseTilePos)?.type
            if (currentType === GroundType.WATER) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.GRASS,
                    mouseTilePos
                )
            } else if (currentType === GroundType.GRASS) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.WATER,
                    mouseTilePos
                )
            } else if (currentType === GroundType.WATERFALL) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.LEDGE,
                    mouseTilePos
                )
            } else if (currentType === GroundType.LEDGE) {
                LocationManager.instance.currentLocation.setGroundElement(
                    GroundType.WATERFALL,
                    mouseTilePos
                )
            }
        },
    ],
    [
        InputKey.PERIOD,
        "delete hovered element",
        (input) =>
            LocationManager.instance.currentLocation.removeElementAt(
                pixelPtToTilePt(input.mousePos)
            ),
    ],
    [
        InputKey.N,
        "fast forward",
        (input) =>
            WorldTime.instance.fastForward(
                input.isKeyHeld(InputKey.SHIFT) ? TimeUnit.MINUTE : TimeUnit.HOUR
            ),
    ],
]

export class DevControls extends Component {
    update(updateData: UpdateData) {
        if (debug.enableDevControls) {
            devCommands.forEach((cmd) => {
                if (updateData.input.isKeyDown(cmd[0])) {
                    console.log(cmd[1])
                    cmd[2](updateData.input)
                }
            })
        }
    }
}

// Set up autocomplete for non-engine debug flags
debug.autoPlay = debug.autoPlay || false
debug.enableBlood = debug.enableBlood || false
debug.enableDevControls = debug.enableDevControls || false
debug.godMode = debug.godMode || false
debug.nightVision = debug.nightVision || false
debug.showAudioLogs = debug.showAudioLogs || false
debug.showGrid = debug.showGrid || false
debug.showInteractables = debug.showInteractables || false
debug.speedMultiplier = debug.speedMultiplier || 1

window["help"] = () => {
    let help = `dev controls (enable with debug.enableDevControls=true)
-------------------------------------------------------\n`
    devCommands.forEach((cmd) => {
        help += `[${InputKeyString.for(cmd[0])}] ${cmd[1]}\n`
    })
    console.log(help)
}
