import { WorldLocation } from "./WorldLocation"
import { Player } from "../characters/Player"
import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"

export class LocationManager {
    
    static instance: LocationManager

    private current: WorldLocation
    get currentLocation() {
        if (!this.current) {
            throw new Error("no locations have been added")
        }
        return this.current
    }
    private locations: Map<string, WorldLocation> = new Map()  // uuid -> location

    constructor() {
        LocationManager.instance = this
    }

    newLocation() {
        const l = new WorldLocation(this)
        this.locations.set(l.uuid, l)
        if (!this.current) {
            this.current = l
        }
        return l
    }

    transition(toUUID: string) {
        const location = this.locations.get(toUUID)
        this.currentLocation.dudes.delete(Player.instance.dude)
        location.dudes.add(Player.instance.dude)

        this.current = location
    }

    save(): LocationManagerSaveState {
        return {
            locations: Array.from(this.locations.values()).map(l => l.save()),
            currentLocationUUID: this.currentLocation.uuid
        }
    }

    static load(saveState: LocationManagerSaveState) {
        const result = new LocationManager()
        result.locations = new Map()
        saveState.locations.forEach(l => {
            const loadedLocation = WorldLocation.load(result, l)
            result.locations.set(l.uuid, loadedLocation)
        })
        result.current = result.locations.get(saveState.currentLocationUUID)
    }
}