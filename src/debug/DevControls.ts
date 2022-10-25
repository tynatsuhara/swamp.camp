import {
    CapturedInput,
    Component,
    debug,
    InputKey,
    InputKeyString,
    Point,
    UpdateData,
} from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { DudeFactory } from "../characters/DudeFactory"
import { DudeSpawner } from "../characters/DudeSpawner"
import { DudeType } from "../characters/DudeType"
import { Player } from "../characters/Player"
import { spawnMagicProjectile } from "../characters/weapons/MagicProjectile"
import { controls } from "../Controls"
import { Particles } from "../graphics/particles/Particles"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { DrawMenu } from "../ui/DrawMenu"
import { UIStateManager } from "../ui/UIStateManager"
import { ElementType } from "../world/elements/Elements"
import { GroundType } from "../world/ground/Ground"
import { camp, here, LocationManager } from "../world/locations/LocationManager"
import { RadiantLocationGenerator } from "../world/locations/RadiantLocationGenerator"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { spawnMenu } from "./SpawnMenu"

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
        (input) => DudeFactory.instance.new(spawnMenu.getSelectedType(), input.mousePos, here()),
    ],
    [
        InputKey.P,
        "show/hide spawn menu",
        () => {
            if (spawnMenu.isOpen) {
                spawnMenu.isOpen = false
            } else if (!UIStateManager.instance.isMenuOpen) {
                spawnMenu.isOpen = true
            }
            if (!spawnMenu.isOpen) {
                spawnMenu.page = 0
            }
        },
    ],
    [
        InputKey.U,
        "generate radiant location",
        () => {
            const l = RadiantLocationGenerator.instance.generate()
            LocationManager.instance.playerLoadLocation(l, Point.ZERO)
        },
    ],
    [
        InputKey.V,
        "open/close draw menu",
        () => {
            if (DrawMenu.instance.isOpen) {
                DrawMenu.instance.close()
            } else {
                DrawMenu.instance.open()
            }
        },
    ],
    [
        InputKey.SEMICOLON,
        "spawn projectile",
        (input) => {
            const standingPos = Player.instance.dude.standingPosition
            spawnMagicProjectile(
                input.mousePos,
                standingPos.minus(input.mousePos).normalized().times(0.15)
            )
        },
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
        "place blackberries",
        (input) => {
            const mouseTilePos = pixelPtToTilePt(input.mousePos)
            here().addElement(ElementType.BLACKBERRIES, mouseTilePos)
            // const currentType = here().getGround(mouseTilePos)?.type
            // if (currentType === GroundType.WATER) {
            //     here().setGroundElement(GroundType.GRASS, mouseTilePos)
            // } else if (currentType === GroundType.GRASS) {
            //     here().setGroundElement(GroundType.WATER, mouseTilePos)
            // } else if (currentType === GroundType.WATERFALL) {
            //     here().setGroundElement(GroundType.LEDGE, mouseTilePos)
            // } else if (currentType === GroundType.LEDGE) {
            //     here().setGroundElement(GroundType.WATERFALL, mouseTilePos)
            // }
        },
    ],
    [
        InputKey.PERIOD,
        "delete hovered element",
        (input) => here().removeElementAt(pixelPtToTilePt(input.mousePos)),
    ],
    [
        InputKey.N,
        "fast forward (shift: 1m, ctrl: 1d, default: 1h)",
        (input) => {
            let time: number
            if (input.isKeyHeld(InputKey.SHIFT)) {
                time = TimeUnit.MINUTE
            } else if (input.isKeyHeld(InputKey.CONTROL)) {
                time = TimeUnit.DAY
            } else {
                time = TimeUnit.HOUR
            }
            WorldTime.instance.fastForward(time)
        },
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
    [InputKey.T, "spawn visitor", () => DudeSpawner.instance.spawnVisitors(true)],
    [InputKey.BACKSPACE, "toggle profiler", () => (debug.showProfiler = !debug.showProfiler)],
]

window["vibrate"] = (duration: number, strongMagnitude: number, weakMagnitude: number) => {
    controls.vibrate({
        duration,
        strongMagnitude,
        weakMagnitude,
    })
}

// Maybe expose this somewhere in the future
window["saveImage"] = () => {
    let data = localStorage.getItem("save")
    console.log(`data length = ${data.length}`)

    if (data.length % 4 !== 0) {
        data += " ".repeat(4 - (data.length % 4))
    }

    let width = Math.ceil(Math.sqrt(data.length / 4))

    const height = width

    const squaredSize = width * height * 4

    data += " ".repeat(squaredSize - data.length)

    const encoder = new TextEncoder()
    const array = encoder.encode(data)
    const imageData = new ImageData(new Uint8ClampedArray(array), width, height)
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d", { alpha: false })
    context.putImageData(imageData, 0, 0)
    document.body.appendChild(canvas)

    // Decode to verify
    const decoder = new TextDecoder()
    const decodedSave = JSON.parse(decoder.decode(imageData.data))
    console.log(decodedSave)
}

export class DevControls extends Component {
    update(updateData: UpdateData) {
        if (debug.enableDevControls) {
            devCommands.forEach((cmd) => {
                if (updateData.input.isKeyDown(cmd[0])) {
                    try {
                        console.log(`executing command: ${cmd[1]}`)
                        cmd[2](updateData.input)
                    } catch (e) {
                        console.error(e)
                    }
                }
            })
        }
    }
}

// Set up autocomplete for non-engine debug flags
debug.enableDevControls ??= false
debug.disableAutosave ??= false
debug.freeCamera ??= false
debug.godMode ??= false
debug.nightVision ??= false
debug.peacefulMode ??= false
debug.showAudioLogs ??= false
debug.showGrid ??= false
debug.showInteractables ??= false
debug.showPathfinding ??= false
debug.showTeleporters ??= false
debug.speedMultiplier ??= 1
debug.showNavMesh ??= false
debug.showElementGrid ??= false
debug.groundRenderDisabled ??= false
debug.showGroundTiles ??= false
debug.forceMapId ??= ""
debug.extraSaveSlots ??= 0

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