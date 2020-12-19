import { Player } from "./characters/Player"
import { Save } from "./saves/SaveGame"
import { LocationManager } from "./world/LocationManager"
import { UIStateManager } from "./ui/UIStateManager"
import { Camera } from "./cutscenes/Camera"
import { DudeType } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { WorldTime } from "./world/WorldTime"
import { EventQueue } from "./world/events/EventQueue"

const SAVE_KEY = "save"

class SaveManager {

    private blob: object

    /**
     * Adds all key/values in newBlob to blob data storage.
     * This DOES NOT flush the data, and save() should be
     * called after if you want to immediately persist the
     * blob data.
     */
    setBlobData(newBlob: object) {
        if (!this.blob) {
            this.getBlobData()    
        }
        this.blob = {
            ...this.blob,
            ...newBlob
        }
    }

    getBlobData() {
        if (!this.blob) {
            if (this.saveFileExists()) {
                // pre-load this before "load" is called to display data on the main menu
                this.blob = this.getSavedData().blob
            } else {
                this.blob = {}
            }
        }
        return this.blob
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
            blob: this.blob,
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

        LocationManager.load(save.locations)
        new WorldTime(save.worldTime)
        new EventQueue(save.eventQueue)

        Camera.instance.focusOnDude(Array.from(LocationManager.instance.currentLocation.dudes).filter(d => d.type === DudeType.PLAYER)[0])

        // clear existing UI state by overwriting singleton
        new UIStateManager()
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
