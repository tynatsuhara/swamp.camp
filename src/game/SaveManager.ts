import { Player } from "./characters/Player"
import { Save, SaveState } from "./saves/SaveGame"
import { LocationManager } from "./world/LocationManager"
import { UIStateManager } from "./ui/UIStateManager"
import { Camera } from "./cutscenes/Camera"
import { DudeType } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { WorldTime } from "./world/WorldTime"
import { EventQueue } from "./world/events/EventQueue"
import { newUUID } from "./saves/uuid"
import { Singletons } from "./Singletons"

const SAVE_KEY = "save"
const CURRENT_SAVE_FORMAT_VERSION = 1

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
            version: CURRENT_SAVE_FORMAT_VERSION,
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

    isSaveFormatVersionCompatible() {
        const save = localStorage.getItem(SAVE_KEY)
        try {
            return JSON.parse(save)["version"] === CURRENT_SAVE_FORMAT_VERSION
        } catch (e) {
            return false
        }
    }

    archiveSave() {
        const save = localStorage.getItem(SAVE_KEY)
        localStorage.setItem(`save-archived-${newUUID()}`, save)
        localStorage.removeItem(SAVE_KEY)
    }

    /**
     * @return true if a save was loaded successfully
     */
    load() {
        const save = this.getSavedData()

        // Logging
        const saveDate = new Date()
        saveDate.setTime(save.timeSaved)
        const timePlayed = new Date(save.state.timePlayed).toISOString().substr(11, 8)
        console.log(`loaded save from ${saveDate} with ${timePlayed} played`)

        Singletons.destroy()
        
        WorldTime.instance.initialize(save.worldTime)
        LocationManager.instance.initialize(save.locations)
        EventQueue.instance.initialize(save.eventQueue)

        // Camera.instance.destroy()
        Camera.instance.focusOnDude(Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.PLAYER)[0])

        // clear existing UI state
        // UIStateManager.instance.destroy()
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
