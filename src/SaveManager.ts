import { debug } from "brigsby/dist"
import { DudeType } from "./characters/DudeType"
import { Player } from "./characters/Player"
import { Camera } from "./cutscenes/Camera"
import { Save, SaveState } from "./saves/SaveGame"
import { newUUID } from "./saves/uuid"
import { Singletons } from "./Singletons"
import { SwampCampGame } from "./SwampCampGame"
import { HUD } from "./ui/HUD"
import { PlumePicker } from "./ui/PlumePicker"
import { EventQueue } from "./world/events/EventQueue"
import { here, LocationManager } from "./world/locations/LocationManager"
import { WorldTime } from "./world/WorldTime"

const CURRENT_SAVE_FORMAT_VERSION = 3
const SLOTS: number = 3 + (debug.extraSaveSlots ?? 0)

class SaveManager {
    // Fields for the currently loaded save
    private saveKey: string
    private state: SaveState

    constructor() {
        for (let slot = 0; slot < SLOTS; slot++) {
            if (!this.isSaveFormatVersionCompatible(slot)) {
                // TODO: add a mechanism for upgrading saves when it's worth the effort
                console.log("archiving incompatible save file")
                this.archiveSave(slot)
            }
        }
    }

    // Current save functions

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
            ...newState,
        }
    }

    /**
     * Returns the current game's save state.
     */
    getState(): SaveState {
        if (!this.state) {
            if (this.getSaveCount() > 0) {
                // pre-load this before "load" is called to display data on the main menu
                this.state = {
                    ...new SaveState(), // initialize default values
                    ...this.getLastSave().state,
                }
            } else {
                this.state = new SaveState()
            }
        }
        return this.state
    }

    autosave() {
        if (!debug.disableAutosave) {
            this.save()
        }
    }

    save(flush = true) {
        if (!Player.instance.dude.isAlive) {
            console.log("cannot save after death")
            return
        }

        const save: Save = {
            version: CURRENT_SAVE_FORMAT_VERSION,
            timeSaved: new Date().getTime(),
            saveVersion: 0,
            locations: LocationManager.instance.save(),
            worldTime: WorldTime.instance.time,
            eventQueue: EventQueue.instance.save(),
            state: this.state,
        }

        if (flush) {
            HUD.instance.showSaveIcon()
            console.log("saved game")
            localStorage.setItem(this.saveKey, JSON.stringify(save))
        }

        return save
    }

    // Save managment functions

    private saveKeyForSlot(slot: number) {
        return Array.from({ length: SLOTS }, (v, k) => `save${k > 0 ? k + 1 : ""}`)[slot]
    }

    getLastSaveSlot() {
        let index = -1
        let timestamp = 0
        const saves = this.getSaves()
        for (let i = 0; i < saves.length; i++) {
            if (saves[i] && saves[i].timeSaved > timestamp) {
                timestamp = saves[i].timeSaved
                index = i
            }
        }
        return index
    }

    getLastSave() {
        return this.getSaves()[this.getLastSaveSlot()]
    }

    getSaveCount() {
        return this.getSaves().filter((save) => !!save).length
    }

    getSaves() {
        return Array.from({ length: SLOTS }, (v, k) => this.getSave(this.saveKeyForSlot(k)))
    }

    private deleteSave(slot: number) {
        localStorage.removeItem(this.saveKeyForSlot(slot))
    }

    private isSaveFormatVersionCompatible(slot: number) {
        const save = localStorage.getItem(this.saveKeyForSlot(slot))
        if (!save) {
            return true
        }
        try {
            return JSON.parse(save).version === CURRENT_SAVE_FORMAT_VERSION
        } catch (e) {
            return false
        }
    }

    private archiveSave(slot: number) {
        const key = this.saveKeyForSlot(slot)
        const save = localStorage.getItem(key)
        localStorage.setItem(`save-archived-${newUUID()}`, save)
        localStorage.removeItem(key)
    }

    new(slot: number, plumePicker: PlumePicker) {
        // overwrite the save if it already exists
        this.deleteSave(slot)
        this.saveKey = this.saveKeyForSlot(slot)
        this.state = new SaveState()
        this.state.plumeIndex = plumePicker.getSelection()
    }

    /**
     * @return true if a save was loaded successfully
     */
    load(slot: number = -1) {
        this.saveKey = slot === -1 ? this.saveKey : this.saveKeyForSlot(slot)

        // ensures that the file exists
        this.loadSave(this.getSave(this.saveKey))
    }

    loadSave(save: Save) {
        this.state = {
            ...new SaveState(), // initialize default values
            ...save.state,
        }

        // Logging
        const saveDate = new Date()
        saveDate.setTime(save.timeSaved)
        const timePlayed = new Date(save.state.timePlayed).toISOString().substr(11, 8)
        console.log(`loaded save from ${saveDate} with ${timePlayed} played`)

        Singletons.clear()

        WorldTime.instance.initialize(save.worldTime)
        LocationManager.instance.initialize(save.locations)
        EventQueue.instance.initialize(save.eventQueue)

        Camera.instance.focusOnDude(
            here()
                .getDudes()
                .find((d) => d.type === DudeType.PLAYER)
        )

        SwampCampGame.instance.loadGameScene()
    }

    private getSave(saveKey: string): Save {
        const saveJson = localStorage.getItem(saveKey)
        if (!saveJson) {
            return null
        }

        return JSON.parse(saveJson)
    }
}

export const saveManager = new SaveManager()
