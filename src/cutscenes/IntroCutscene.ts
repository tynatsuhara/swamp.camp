import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DIP_STARTING_DIALOGUE } from "../characters/dialogue/DipDialogue"
import { Dude } from "../characters/Dude"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { DudeFaction, DudeFactory, DudeType } from "../characters/DudeFactory"
import { Player } from "../characters/Player"
import { TILE_SIZE } from "../graphics/Tilesets"
import { saveManager } from "../SaveManager"
import { ControlsUI } from "../ui/ControlsUI"
import { HUD } from "../ui/HUD"
import { Queequeg } from "../world/elements/Queequeg"
import { LocationManager } from "../world/LocationManager"
import { Camera } from "./Camera"
import { CutsceneManager } from "./CutsceneManager"
import { CutscenePlayerController } from "./CutscenePlayerController"
import { TextOverlayManager } from "./TextOverlayManager"

// This is the cutscene that plays when the player arrives in the new land
export class IntroCutscene extends Component {
    // durations in ms
    private readonly START_WALKING_IN = 1000
    private readonly PAN_TO_DIP = this.START_WALKING_IN + 3000
    private readonly GET_OFF_SHIP = this.PAN_TO_DIP + 500
    private readonly PAN_BACK = this.GET_OFF_SHIP + 1500

    private waitingForOrcsToDie = false
    private orcs: Dude[]
    private dip: Dude

    /**
     * 1. position player in corner
     * 2. player walks in
     * 3. camera pan to DIP
     * 4. camera pan back to player
     * 5. show combat UI
     */

    constructor() {
        super()

        // This should probably be in start(), but since the IntroCutscene
        // has to start before the initial render, we do it in the
        // constructor to prevent a single-frame "flash" of the actual game

        DudeFactory.instance.new(DudeType.DIP, Point.ZERO)
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(3, 1).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-1, 3).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-4, 0).times(TILE_SIZE))

        const characterAnimation = (key: string, transform: SpriteTransform) => {
            const anim = DudeAnimationUtils.getCharacterIdleAnimation(key).toComponent(transform)
            anim.transform.position = new Point(
                transform.position.x,
                transform.position.y - transform.dimensions.y
            )
            anim.fastForward(Math.random() * 1000) // don't have the animations in sync
            return anim
        }

        const centerPos = new Point(Camera.instance.dimensions.x / 2, TextOverlayManager.TOP_BORDER)

        const charactersAtTop = [
            characterAnimation(
                "MountainKing",
                SpriteTransform.new({ position: centerPos.plusX(-35) })
            ),
            characterAnimation(
                "knight_f",
                SpriteTransform.new({
                    position: centerPos.plusX(9),
                    mirrorX: true,
                })
            ),
        ]

        const text = [
            `Champion, your time has come!

Our explorers have discovered a vast coastal swampland, untamed and full of precious resources.

We believe that the Kingdom could benefit greatly from establishing a settlement in these uncharted lands.`,
            `... 

However, due to budgetary constraints, you'll be going alone. 

Once you establish a camp and begin demonstrating value, we shall send more settlers and grow the camp into a colony!`,
            `...

One other thing - We believe that several other factions may be vying for control of these lands. Form alliances or engage them in battle as you deem necessary.`,
            `...

ANOTHER thing - Only one of the explorers returned, and she reported that her colleagues were devoured by demons in the night.`,
            `...`,
            `Good luck. Go now, venture into the swamp, and bring glory to the Kingdom!`,
            "", // blank page to show controls
        ]

        const controlsUI = new ControlsUI(TextOverlayManager.VERTICAL_MARGIN)

        TextOverlayManager.instance.open({
            text,
            finishAction: "START",
            onFinish: () =>
                HUD.instance.locationTransition.transition(() => this.cutscene(), 100, true),
            additionalComponents: (index) => [
                ...charactersAtTop,
                index === text.length - 1 ? controlsUI : undefined,
            ],
        })
    }

    cutscene() {
        CutscenePlayerController.instance.enable()

        this.dip = LocationManager.instance.currentLocation
            .getDudes()
            .filter((d) => d.type === DudeType.DIP)[0]

        Queequeg.instance.pushPassenger(Player.instance.dude)

        setTimeout(() => {
            Queequeg.instance.arrive()
        }, this.START_WALKING_IN)

        setTimeout(() => {
            Camera.instance.focusOnPoint(this.dip.standingPosition)
        }, this.PAN_TO_DIP)

        setTimeout(() => {
            Queequeg.instance.removePassenger(Player.instance.dude)
        }, this.GET_OFF_SHIP)

        setTimeout(() => {
            this.dip.dialogue = DIP_STARTING_DIALOGUE
            CutscenePlayerController.instance.disable()
            Camera.instance.focusOnDude(Player.instance.dude)
            this.waitingForOrcsToDie = true
            Queequeg.instance.depart()
        }, this.PAN_BACK)
    }

    update(updateData: UpdateData) {
        if (!this.waitingForOrcsToDie) {
            return
        }

        if (!this.orcs) {
            this.orcs = LocationManager.instance.currentLocation
                .getDudes()
                .filter((d) => d.factions.includes(DudeFaction.ORCS))
        }

        // TODO prevent the player from going to a different location until this is over

        if (!this.orcs.some((o) => o.isAlive)) {
            CutsceneManager.instance.finishCutscene()
            saveManager.save()
        }
    }
}
