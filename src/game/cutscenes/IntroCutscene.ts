import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { CutscenePlayerController } from "./CutscenePlayerController"
import { Player } from "../characters/Player"
import { Point } from "../../engine/Point"
import { Camera } from "./Camera"
import { CutsceneManager } from "./CutsceneManager"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { DudeFaction, DudeFactory, DudeType } from "../characters/DudeFactory"
import { makeControlsUI } from "../ui/ControlsUI"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { DIP_STARTING_DIALOGUE } from "../characters/dialogues/DipIntro"
import { TextOverlayManager } from "./TextOverlayManager"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { saveManager } from "../SaveManager"

// This is the cutscene that plays when the player arrives in the new land
export class IntroCutscene extends Component {

    // durations in ms
    private readonly START_WALKING_IN = 1000
    private readonly STOP_WALKING_IN = this.START_WALKING_IN + 2000
    private readonly PAN_TO_DIP = this.STOP_WALKING_IN + 750
    private readonly PAN_BACK = this.PAN_TO_DIP + 2000
    private readonly HIDE_CONTROLS = this.PAN_BACK + 7000

    private waitingForOrcsToDie = false
    private orcs: Dude[]
    private dip: Dude
    private showControls = false

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

        const characterAnimation = (key: string, transform: TileTransform) => {
            const anim = DudeAnimationUtils.getCharacterIdleAnimation(key).toComponent(transform)
            anim.transform.position = new Point(transform.position.x, transform.position.y - transform.dimensions.y)
            anim.fastForward(Math.random() * 1000)  // don't have the animations in sync
            return anim
        }

        const centerPos = new Point(Camera.instance.dimensions.x/2, TextOverlayManager.TOP_BORDER)
        
        TextOverlayManager.instance.enable([
`Champion, your time has come!

Our explorers have discovered a vast swampland, untamed and full of precious resources.

We believe that the Kingdom could benefit greatly from establishing a settlement in these uncharted lands.`,
`... 

However, due to budgetary constraints, you'll be going alone. 

Once you establish a camp and begin demonstrating value, we shall send more settlers and grow the camp into a colony!`,
`...

One other thing - We believe that several other factions may be vying for control of these lands. Form alliances or engage them in battle as you deem necessary.`,
`...

ANOTHER thing - Only one of the explorers returned, and she reported that her colleagues were devoured by demons in the night.`,
`...`,
`Good luck. Go now, venture into the swamp, and bring glory to the Kingdom!`
            ], 
            "START",
            () => this.cutscene(),
            [
                characterAnimation("MountainKing", TileTransform.new({ position: centerPos.plusX(-35) })),
                characterAnimation("knight_f", TileTransform.new({ position: centerPos.plusX(9), mirrorX: true })),
            ]
        )
    }

    cutscene() {
        CutscenePlayerController.instance.enable()
        this.dip = Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.DIP)[0]

        setTimeout(() => {
            CutscenePlayerController.instance.startMoving(new Point(-1, 0))
        }, this.START_WALKING_IN)

        setTimeout(() => { 
            CutscenePlayerController.instance.stopMoving() 
        }, this.STOP_WALKING_IN)

        setTimeout(() => { 
            Camera.instance.focusOnPoint(this.dip.standingPosition)
            CutscenePlayerController.instance.disable()
        }, this.PAN_TO_DIP)

        setTimeout(() => { 
            this.showControls = true
            Camera.instance.focusOnDude(Player.instance.dude)
            this.waitingForOrcsToDie = true
        }, this.PAN_BACK)
        
        setTimeout(() => {
            this.showControls = false
        }, this.HIDE_CONTROLS)
    }

    update(updateData: UpdateData) {
        if (!this.waitingForOrcsToDie) {
            return
        }
        
        if (!this.orcs) {
            this.orcs = Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.factions.includes(DudeFaction.ORCS))
        }

        // TODO prevent the player from going to a different location until this is over

        if (!this.orcs.some(o => o.isAlive)) {
            this.dip.dialogue = DIP_STARTING_DIALOGUE
            CutsceneManager.instance.finishCutscene()
            saveManager.save()
        }
    }

    getRenderMethods(): RenderMethod[] {
        if (this.showControls) {
            return makeControlsUI(Camera.instance.dimensions, Camera.instance.position)
        }
        return []
    }
}