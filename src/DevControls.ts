import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { CapturedInput, InputKey, InputKeyString } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { Condition } from "./characters/Condition"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { DudeSpawner } from "./characters/DudeSpawner"
import { Player } from "./characters/Player"
import { controls } from "./Controls"
import { TextOverlayManager } from "./cutscenes/TextOverlayManager"
import { pixelPtToTilePt } from "./graphics/Tilesets"
import { TextAlign, TextIcon } from "./ui/Text"
import { ElementType } from "./world/elements/Elements"
import { GroundType } from "./world/ground/Ground"
import { camp, LocationManager } from "./world/LocationManager"
import { TimeUnit } from "./world/TimeUnit"
import { WorldTime } from "./world/WorldTime"

const SPAWNABLE_TYPES = [
    DudeType.GNOLL_SCOUT,
    DudeType.BLACKSMITH,
    DudeType.SPOOKY_VISITOR,
    DudeType.VILLAGER,
    DudeType.SHROOM,
    DudeType.NUN,
    DudeType.CLERIC,
    DudeType.BISHOP,
    DudeType.DOCTOR,
    DudeType.BEAR,
    DudeType.WOLF,
    DudeType.DEMON_BRUTE,
]
export const spawnMenu = {
    show: false,
    selectedType: SPAWNABLE_TYPES[0],
    types: SPAWNABLE_TYPES,
}

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    [
        InputKey.I,
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
    [
        InputKey.O,
        "spawn selected type",
        (input) =>
            DudeFactory.instance.new(
                spawnMenu.selectedType,
                input.mousePos,
                LocationManager.instance.currentLocation
            ),
    ],
    [InputKey.P, "show spawn menu", () => (spawnMenu.show = !spawnMenu.show)],
    [
        InputKey.U,
        "spawn queequeg",
        () => camp().addElement(ElementType.QUEEQUEG, new Point(camp().size / 2 - 6, 10)),
    ],
    [InputKey.V, "spawn wolf pack", () => DudeSpawner.instance.spawnWolves()],
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
    [
        InputKey.Y,
        "vanish spooky visitor(s)",
        () =>
            camp()
                .getDudes()
                .filter((d) => d.type === DudeType.SPOOKY_VISITOR)
                .forEach((d) => d.entity.selfDestruct()),
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
                    console.log(`executing command: ${cmd[1]}`)
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
debug.showNavMesh = debug.showNavMesh || false

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
