import { Component } from "../../engine/component"
import { StartData, UpdateData } from "../../engine/engine"
import { CutscenePlayerController } from "./CutscenePlayerController"
import { Player } from "../characters/Player"
import { Point } from "../../engine/point"
import { MapGenerator } from "../world/MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Camera } from "./Camera"
import { CutsceneManager } from "./CutsceneManager"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { DudeFaction, DudeType } from "../characters/DudeFactory"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { Dialogue } from "../characters/Dialogue"

// This is the cutscene that plays when the player arrives in the new land
export class IntroCutscene extends Component {

    // durations in ms
    private readonly STOP_WALKING_IN = 2000
    private readonly PAN_TO_DIP = this.STOP_WALKING_IN + 750
    private readonly PAN_BACK = this.PAN_TO_DIP + 2000

    private waitingForOrcsToDie = false
    private orcs: Dude[]

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
        CutscenePlayerController.instance.startMoving(new Point(-1, 0))  // TODO: Make sure there are no trees in their way

        setTimeout(() => { 
            CutscenePlayerController.instance.stopMoving() 
        }, this.STOP_WALKING_IN)

        setTimeout(() => { 
            Camera.instance.focusOnPoint(new Point(0, 0))
            CutscenePlayerController.instance.disable()
        }, this.PAN_TO_DIP)

        setTimeout(() => { 
            Camera.instance.focusOnDude(Player.instance.dude)
            this.waitingForOrcsToDie = true
        }, this.PAN_BACK)
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
            const dip = Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.DIP)[0]
            dip.dialogue = Dialogue.DIP_0

            CutsceneManager.instance.finishCutscene()
        }
    }
}