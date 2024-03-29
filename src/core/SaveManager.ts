import { debug, expose } from "brigsby/dist"
import { player } from "../characters/player"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { prettyPrint } from "../debug/JSON"
import { ONLINE_PLAYER_DUDE_ID_PREFIX } from "../online/syncUtils"
import { Save, SaveState } from "../saves/SaveGame"
import { newUUID } from "../saves/uuid"
import { PlumePicker } from "../ui/PlumePicker"
import { UIStateManager } from "../ui/UIStateManager"
import { WorldTime, now } from "../world/WorldTime"
import { EventQueue } from "../world/events/EventQueue"
import { LocationManager, here } from "../world/locations/LocationManager"
import { Singletons } from "./Singletons"
import { SwampCampGame } from "./SwampCampGame"

const CURRENT_SAVE_FORMAT_VERSION = 3 // TODO bump this when appropriate
const SLOTS: number = 3 + (debug.extraSaveSlots ?? 0)

/**
 * 'save' — actually saving the world to storage
 * 'multiplayer' — syncing this world to another person over the internet
 */
export type SaveContext = "save" | "multiplayer"

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
        const { isMidCutscene } = CutsceneManager.instance
        const { isMenuOpen } = UIStateManager.instance
        const { disableAutosave } = debug

        const skipFlags = { isMidCutscene, isMenuOpen, disableAutosave }
        const skipAutoSave = Object.values(skipFlags).some((val) => val)

        if (skipAutoSave) {
            if (debug.showSaveLogs) {
                console.log(`skipping autosave: ${prettyPrint(skipFlags)}`)
            }
        } else {
            this.save()
        }
    }

    save(context: SaveContext = "save") {
        if (!player().isAlive) {
            console.log("cannot save after death")
            return
        }

        const onlinePlayers =
            context === "multiplayer"
                ? {} // don't send potentially sensitive multiplayer info to peers!
                : here()
                      .getDudes()
                      .filter((d) => d.uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX))
                      .reduce((map, dude) => {
                          const password = map[dude.uuid].password
                          map[dude.uuid] = {
                              ...dude.save(),
                              password,
                          }
                          return map
                      }, this.state.onlinePlayers)

        const save: Save = {
            version: CURRENT_SAVE_FORMAT_VERSION,
            timeSaved: Date.now(),
            locations: LocationManager.instance.save(context),
            worldTime: now(),
            eventQueue: EventQueue.instance.save(),
            state: {
                ...this.state,
                onlinePlayers,
            },
        }

        if (context === "save") {
            if (debug.showSaveLogs) {
                console.log("saved game")
            }
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
        Singletons.clear()

        // overwrite the save if it already exists
        this.deleteSave(slot)
        this.saveKey = this.saveKeyForSlot(slot)
        this.state = new SaveState()
        this.state.plumeIndex = plumePicker.getSelection()
    }

    /**
     * @return true if a save was loaded successfully
     */
    load(slot: number) {
        this.saveKey = this.saveKeyForSlot(slot)

        // ensures that the file exists
        this.loadSave(this.getSave(this.saveKey))
    }

    loadSave(save: Save) {
        Singletons.clear()

        const start = new Date().getTime()

        this.state = {
            ...new SaveState(), // initialize default values
            ...save.state,
        }

        // Logging
        const saveDate = new Date()
        saveDate.setTime(save.timeSaved)
        const timePlayed = new Date(save.state.timePlayed).toISOString().substr(11, 8)
        console.log(`loaded save from ${saveDate} with ${timePlayed} played`)

        WorldTime.instance.initialize(save.worldTime)
        LocationManager.instance.initialize(save.locations)
        EventQueue.instance.initialize(save.eventQueue)

        SwampCampGame.instance.loadGameScene()

        Camera.instance.focusOnDude(player())

        console.log(`loading save took ${new Date().getTime() - start} ms`)
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

// Autosave when the page is closed, refreshed, etc
window.onbeforeunload = () => {
    if (SwampCampGame.instance.scene === SwampCampGame.instance.gameScene) {
        saveManager.autosave()
    }
}

const getSaveState = () => saveManager.getState()
const setSaveState = (newState: SaveState) => saveManager.setState(newState)
expose({ getSaveState, setSaveState })
