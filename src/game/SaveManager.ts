import { Player } from "./characters/Player"
import { Save, SaveState } from "./saves/SaveGame"
import { LocationManager } from "./world/LocationManager"
import { UIStateManager } from "./ui/UIStateManager"
import { Camera } from "./cutscenes/Camera"
import { DudeType } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { WorldTime } from "./world/WorldTime"
import { EventQueue } from "./world/events/EventQueue"

const SAVE_KEY = "save"

class SaveManager {

    private state: SaveState

    /**
     * Adds all key/values in newState to the save state.
     * This DOES NOT flush the data, and save() should be
     * called after if you want to immediately persist it.
     */
    setState(newState: SaveState) {
        if (!this.state) {
            this.getState()    
        }
        this.state = {
            ...this.state,
            ...newState
        }
    }

    getState(): SaveState {
        if (!this.state) {
            if (this.saveFileExists()) {
                // pre-load this before "load" is called to display data on the main menu
                this.state = this.getSavedData().state
            } else {
                this.state = new SaveState()
            }
        }
        return this.state
    }

    save() {
        if (!Player.instance.dude.isAlive) {
            console.log("cannot save after death")
            return
        }
        HUD.instance.showSaveIcon()
        const save: Save = {
            timeSaved: new Date().getTime(),
            saveVersion: 0,
            locations: LocationManager.instance.save(),
            worldTime: WorldTime.instance.time,
            eventQueue: EventQueue.instance.save(),
            state: this.state,
        }
        console.log("saved game")
        localStorage.setItem(SAVE_KEY, JSON.stringify(save))  // TODO support save slots
    }

    saveFileExists() {
        return !!localStorage.getItem(SAVE_KEY)
    }

    deleteSave() {
        localStorage.removeItem(SAVE_KEY)
    }

    /**
     * @return true if a save was loaded successfully
     */
    load() {
        const save = this.getSavedData()
        const prettyPrintTimestamp = new Date()
        prettyPrintTimestamp.setTime(save.timeSaved)
        console.log(`loaded save from ${prettyPrintTimestamp}`)

        LocationManager.instance.initialize(save.locations)
        WorldTime.instance.initialize(save.worldTime)
        EventQueue.instance.initialize(save.eventQueue)

        Camera.instance.focusOnDude(Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.PLAYER)[0])

        // clear existing UI state
        UIStateManager.instance.destroy()
    }

    private getSavedData(): Save {
        const saveJson = localStorage.getItem(SAVE_KEY)
        if (!saveJson) {
            console.log("no save found")
            return
        }
        
        return JSON.parse(saveJson)
    }
}

export const saveManager = new SaveManager()
