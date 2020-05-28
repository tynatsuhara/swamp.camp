import { Player } from "./characters/Player"
import { Save } from "./saves/SaveGame"
import { LocationManager } from "./world/LocationManager"
import { UIStateManager } from "./ui/UIStateManager"
import { Camera } from "./cutscenes/Camera"
import { DudeType } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { WorldTime } from "./world/WorldTime"
import { EventQueue } from "./world/events/EventQueue"

export class SaveManager {

    static instance: SaveManager

    constructor() {
        SaveManager.instance = this
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
            eventQueue: EventQueue.instance.save()
        }
        console.log("saved game")
        localStorage.setItem("save", JSON.stringify(save))  // TODO support save slots
    }

    /**
     * @return true if a save was loaded successfully
     */
    load(): Save {
        const blob = localStorage.getItem("save")
        if (!blob) {
            console.log("no save found")
            return null
        }
        
        const save: Save = JSON.parse(blob)
        const prettyPrintTimestamp = new Date()
        prettyPrintTimestamp.setTime(save.timeSaved)
        console.log(`loaded save from ${prettyPrintTimestamp}`)

        return save
    }
}