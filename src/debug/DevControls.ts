import {
    CapturedInput,
    Component,
    debug,
    expose,
    InputKey,
    InputKeyString,
    Point,
    UpdateData,
} from "brigsby/dist"
import { renderer } from "brigsby/dist/renderer"
import { DudeFactory } from "../characters/DudeFactory"
import { DudeSpawner } from "../characters/DudeSpawner"
import { DudeType } from "../characters/DudeType"
import { player } from "../characters/player"
import { spawnMagicProjectile } from "../characters/weapons/MagicProjectile"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { session } from "../online/session"
import { SwampCampGame } from "../SwampCampGame"
import { DrawMenu } from "../ui/DrawMenu"
import { UIStateManager } from "../ui/UIStateManager"
import { ElementType } from "../world/elements/Elements"
import { GroundType } from "../world/ground/Ground"
import { LocationFactory } from "../world/locations/LocationFactory"
import { camp, here, LocationManager } from "../world/locations/LocationManager"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { spawnMenu } from "./SpawnMenu"

const devCommands: [InputKey, string, (input: CapturedInput) => void][] = [
    [
        InputKey.BACKSLASH,
        "toggle profiler",
        () => {
            if (
                debug.showProfiler &&
                !debug.showBigProfiler &&
                SwampCampGame.instance.scene === SwampCampGame.instance.gameScene
            ) {
                debug.showBigProfiler = true
            } else {
                debug.showBigProfiler = false
                debug.showProfiler = !debug.showProfiler
            }
        },
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
        InputKey.O,
        "spawn selected type",
        (input) => DudeFactory.instance.create(spawnMenu.getSelectedType(), input.mousePos, here()),
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
    // [
    //     InputKey.I,
    //     "smoke bomb",
    //     () => {
    //         const pos = player().standingPosition
    //         const radius = 45
    //         const depth = pos.y + radius

    //         // smoke
    //         for (let i = 0; i < 1250; i++) {
    //             const speed = Math.random() > 0.5 ? -0.001 : -0.005
    //             Particles.instance.emitParticle(
    //                 Lists.oneOf([Color.WHITE, Color.WHITE, Color.TAUPE_6]),
    //                 pos.randomCircularShift(radius).plusY(-4),
    //                 depth,
    //                 1000 + Math.random() * 2500,
    //                 (t) => new Point(0, t * speed),
    //                 Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
    //             )
    //         }
    //     },
    // ],
    [
        InputKey.I,
        "damage player",
        () => {
            player().damage(0.25)
        },
    ],
    [
        InputKey.U,
        "generate radiant location",
        () => {
            LocationFactory.instance
                .newRadiantLocation()
                .then((l) => LocationManager.instance.playerLoadLocation(l, Point.ZERO))
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
            const standingPos = player().standingPosition
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
        (input) => {
            const { x, y } = pixelPtToTilePt(input.mousePos)
            here().removeElementAt(x, y)
        },
    ],
    // [
    //     InputKey.PERIOD,
    //     "grow hovered growable",
    //     (input) => {
    //         const growable = here()
    //             .getElement(pixelPtToTilePt(input.mousePos))
    //             ?.entity.getComponent(Growable)
    //         console.log(`growable = ${growable}`)
    //         growable?.forceGrow()
    //     },
    // ],

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
]

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
debug.showSaveLogs ??= false
debug.disableVisibleRegionMask ??= false
debug.disableParticles ??= false
debug.photoMode ??= false
debug.fixedHeight ??= undefined
debug.staticsHostOverride ??= undefined
debug.showClickableUiPoints ??= false

const help = () => {
    let help = "dev controls (enable with debug.enableDevControls=true)"
    const commands = devCommands.map((cmd) => `[${InputKeyString.for(cmd[0])}] ${cmd[1]}`)
    console.log(help + "\n\n" + commands.join("\n"))
}
help()

const screenshot = () => {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas")
    const data = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = data
    a.download = `SWAMP_CAMP_${Math.floor(new Date().getTime() / 1000)}.png`
    a.click()
}

// debug chat
const [sendChat, receiveChat] = session.action<string>("chat")
const chat = (text: string) => {
    sendChat(text)
}
receiveChat((text, peerId) => console.log(`[chat] ${peerId} > ${text}`))

expose({ help, screenshot, chat, Point, renderer })
