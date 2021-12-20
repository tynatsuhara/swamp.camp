import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { CapturedInput, InputKey, InputKeyString } from "brigsby/dist/Input"
import { Condition } from "./characters/Condition"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { DudeSpawner } from "./characters/DudeSpawner"
import { Player } from "./characters/Player"
import { controls } from "./Controls"
import { TextOverlayManager } from "./cutscenes/TextOverlayManager"
import { pixelPtToTilePt } from "./graphics/Tilesets"
import { TextAlign, TextIcon } from "./ui/Text"
import { GroundType } from "./world/ground/Ground"
import { LocationManager } from "./world/LocationManager"
import { TimeUnit } from "./world/TimeUnit"
import { WorldTime } from "./world/WorldTime"

const spawn = (type: DudeType) => {
    return (input: CapturedInput) =>
        DudeFactory.instance.new(type, input.mousePos, LocationManager.instance.currentLocation)
}

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    [
        InputKey.O,
        "show town stats",
        () =>
            TextOverlayManager.instance.open({
                text: [
                    [
                        `blah ${TextIcon.FACE_VERY_SAD}`,
                        `blah ${TextIcon.FACE_SAD}`,
                        `blah ${TextIcon.FACE_NEUTRAL}`,
                        `blah ${TextIcon.FACE_HAPPY}`,
                        `blah ${TextIcon.FACE_VERY_HAPPY}`,
                    ].join("\n\n"),
                ],
                finishAction: "OKAY",
                textAlign: TextAlign.CENTER,
            }),
    ],
    [InputKey.I, "spawn doctor", spawn(DudeType.DOCTOR)],
    [InputKey.P, "spawn nun", spawn(DudeType.NUN)],
    [
        InputKey.U,
        "set player on fire",
        () => Player.instance.dude.addCondition(Condition.ON_FIRE, 2_000),
    ],
    [InputKey.B, "spawn bear", spawn(DudeType.BEAR)],
    [InputKey.V, "spawn wolf", spawn(DudeType.WOLF)],
    [
        InputKey.SEMICOLON,
        "poison player",
        () => Player.instance.dude.addCondition(Condition.POISONED, 10_000),
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

window["vibrate"] = (duration: number, strongMagnitude: number, weakMagnitude: number) => {
    controls.vibrate({
        duration,
        strongMagnitude,
        weakMagnitude,
    })
}

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
debug.freeCamera = debug.freeCamera || false
debug.godMode = debug.godMode || false
debug.nightVision = debug.nightVision || false
debug.peacefulMode = debug.peacefulMode || false
debug.showAudioLogs = debug.showAudioLogs || false
debug.showGrid = debug.showGrid || false
debug.showInteractables = debug.showInteractables || false
debug.showPathfinding = debug.showPathfinding || false
debug.showTeleporters = debug.showTeleporters || false
debug.speedMultiplier = debug.speedMultiplier || 1

const help = () => {
    let help = `dev controls (enable with debug.enableDevControls=true)
-------------------------------------------------------\n`
    devCommands.forEach((cmd) => {
        help += `[${InputKeyString.for(cmd[0])}] ${cmd[1]}\n`
    })
    console.log(help)
}
window["help"] = help
help()
