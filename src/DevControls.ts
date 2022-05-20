import { Component } from "brigsby/dist/Component"
import { debug } from "brigsby/dist/Debug"
import { UpdateData } from "brigsby/dist/Engine"
import { CapturedInput, InputKey, InputKeyString } from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { Condition } from "./characters/Condition"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { DudeSpawner } from "./characters/DudeSpawner"
import { Player } from "./characters/Player"
import { Berto } from "./characters/types/Berto"
import { controls } from "./Controls"
import { Particles } from "./graphics/Particles"
import { pixelPtToTilePt } from "./graphics/Tilesets"
import { newUUID } from "./saves/uuid"
import { Color } from "./ui/Color"
import { GroundType } from "./world/ground/Ground"
import { camp, here, LocationManager } from "./world/LocationManager"
import { RadiantLocationGenerator } from "./world/RadiantLocationGenerator"
import { TimeUnit } from "./world/TimeUnit"
import { WorldTime } from "./world/WorldTime"

const SPAWNABLE_TYPES = [
    DudeType.FOREST_GUARDIAN,
    DudeType.KNIGHT,
    DudeType.ONION,
    DudeType.GUMBALL,
    DudeType.TRAVELING_MERCHANT,
    DudeType.GNOLL_SCOUT,
    DudeType.BLACKSMITH,
    DudeType.SPOOKY_VISITOR,
    DudeType.VILLAGER,
    // DudeType.SHROOM,
    // DudeType.NUN,
    // DudeType.CLERIC,
    // DudeType.BISHOP,
    DudeType.DOCTOR,
    DudeType.BEAR,
    DudeType.WOLF,
    DudeType.DEMON_BRUTE,
    DudeType.CENTAUR,
]
export const spawnMenu = {
    show: false,
    selectedType: SPAWNABLE_TYPES[0],
    types: SPAWNABLE_TYPES,
}

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    // [
    //     InputKey.I,
    //     "show town stats",
    //     () =>
    //         TextOverlayManager.instance.open({
    //             text: [
    //                 [
    //                     `blah ${TextIcon.FACE_VERY_SAD}`,
    //                     `blah ${TextIcon.FACE_SAD}`,
    //                     `blah ${TextIcon.FACE_NEUTRAL}`,
    //                     `blah ${TextIcon.FACE_HAPPY}`,
    //                     `blah ${TextIcon.FACE_VERY_HAPPY}`,
    //                 ].join("\n\n"),
    //             ],
    //             finishAction: "OKAY",
    //             textAlign: TextAlign.CENTER,
    //         }),
    // ],
    [
        InputKey.I,
        "smoke bomb",
        () => {
            const pos = Player.instance.dude.standingPosition
            const radius = 45
            const depth = pos.y + radius

            // smoke
            for (let i = 0; i < 1250; i++) {
                const speed = Math.random() > 0.5 ? -0.001 : -0.005
                Particles.instance.emitParticle(
                    Lists.oneOf([Color.WHITE, Color.WHITE, Color.TAUPE_6]),
                    pos.randomCircularShift(radius).plusY(-4),
                    depth,
                    1000 + Math.random() * 2500,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        },
    ],
    [
        InputKey.O,
        "spawn selected type",
        (input) => DudeFactory.instance.new(spawnMenu.selectedType, input.mousePos, here()),
    ],
    [InputKey.P, "show spawn menu", () => (spawnMenu.show = !spawnMenu.show)],
    [
        InputKey.U,
        "generate radiant location",
        () => {
            const l = RadiantLocationGenerator.instance.generate()
            LocationManager.instance.playerLoadLocation(l, Point.ZERO)
        },
    ],
    [InputKey.V, "spawn wolf pack", () => DudeSpawner.instance.spawnWolves()],
    [
        InputKey.SEMICOLON,
        "inflict black lung",
        () => Player.instance.dude.addCondition(Condition.BLACK_LUNG),
    ],
    [InputKey.QUOTE, "trigger orc raid", () => DudeSpawner.instance.spawnOrcs()],
    [
        InputKey.COMMA,
        "toggle ground path",
        (input) => {
            const mouseTilePos = pixelPtToTilePt(input.mousePos)
            const currentType = here().getGround(mouseTilePos)?.type
            if (currentType === GroundType.PATH) {
                here().setGroundElement(GroundType.GRASS, mouseTilePos)
            } else if (currentType === GroundType.GRASS) {
                here().setGroundElement(GroundType.PATH, mouseTilePos)
            }
        },
    ],
    [
        InputKey.L,
        "place water",
        (input) => {
            const mouseTilePos = pixelPtToTilePt(input.mousePos)
            const currentType = here().getGround(mouseTilePos)?.type
            if (currentType === GroundType.WATER) {
                here().setGroundElement(GroundType.GRASS, mouseTilePos)
            } else if (currentType === GroundType.GRASS) {
                here().setGroundElement(GroundType.WATER, mouseTilePos)
            } else if (currentType === GroundType.WATERFALL) {
                here().setGroundElement(GroundType.LEDGE, mouseTilePos)
            } else if (currentType === GroundType.LEDGE) {
                here().setGroundElement(GroundType.WATERFALL, mouseTilePos)
            }
        },
    ],
    [
        InputKey.PERIOD,
        "delete hovered element",
        (input) => here().removeElementAt(pixelPtToTilePt(input.mousePos)),
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
    [
        InputKey.T,
        "add test announcement",
        () =>
            here()
                .getDudes()
                .filter((d) => d.type === DudeType.HERALD)[0]
                .entity.getComponent(Berto)
                .addAnnouncement({
                    id: newUUID(),
                }),
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
debug.enableBlood = debug.enableBlood ?? false
debug.enableDevControls = debug.enableDevControls ?? false
debug.freeCamera = debug.freeCamera ?? false
debug.godMode = debug.godMode ?? false
debug.nightVision = debug.nightVision ?? false
debug.peacefulMode = debug.peacefulMode ?? false
debug.showAudioLogs = debug.showAudioLogs ?? false
debug.showGrid = debug.showGrid ?? false
debug.showInteractables = debug.showInteractables ?? false
debug.showPathfinding = debug.showPathfinding ?? false
debug.showTeleporters = debug.showTeleporters ?? false
debug.speedMultiplier = debug.speedMultiplier ?? 1
debug.showNavMesh = debug.showNavMesh ?? false
debug.showElementGrid = debug.showElementGrid ?? false
debug.groundRenderDisabled = debug.groundRenderDisabled ?? false
debug.showGroundTiles = debug.showGroundTiles ?? false

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
