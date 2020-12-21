import { Component } from "../../engine/component"
import { StartData, UpdateData } from "../../engine/engine"
import { CutscenePlayerController } from "./CutscenePlayerController"
import { Player } from "../characters/Player"
import { Point } from "../../engine/point"
import { Camera } from "./Camera"
import { CutsceneManager } from "./CutsceneManager"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { DudeFaction, DudeType } from "../characters/DudeFactory"
import { makeControlsUI } from "../ui/ControlsUI"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { DIP_STARTING_DIALOGUE } from "../characters/dialogues/DipIntro"

// This is the cutscene that plays when the player arrives in the new land
export class IntroCutscene extends Component {

    // durations in ms
    private readonly STOP_WALKING_IN = 2000
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
     * TODO later (maybe in a separate mechanism?):
     * 5. combat tutorial
     * ...
     * N. Once enemies are dead, progress StoryState and autosave
     */

    start(startData: StartData) {
        CutscenePlayerController.instance.enable()
        CutscenePlayerController.instance.startMoving(new Point(-1, 0))
        this.dip = Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.DIP)[0]

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
        }, this.HIDE_CONTROLS);
    }

    update(updateData: UpdateData) {
        if (!this.waitingForOrcsToDie) {
            return
        }
        
        if (!this.orcs) {
            this.orcs = Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.faction === DudeFaction.ORCS)
        }

        // TODO prevent the player from going to a different location until this is over

        if (!this.orcs.some(o => o.isAlive)) {
            this.dip.dialogue = DIP_STARTING_DIALOGUE

            CutsceneManager.instance.finishCutscene()
        }
    }

    getRenderMethods(): RenderMethod[] {
        if (this.showControls) {
            return makeControlsUI(Camera.instance.dimensions, Camera.instance.position)
        }
        return []
    }
}