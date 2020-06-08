import { WorldLocation } from "./WorldLocation"
import { Player } from "../characters/Player"
import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"

export class LocationManager {
    
    static instance: LocationManager

    currentLocation: WorldLocation
    private locations: Map<string, WorldLocation> = new Map()  // uuid -> location

    constructor() {
        LocationManager.instance = this
    }

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    newLocation(isInterior: boolean) {
        const l = new WorldLocation(this, isInterior)
        this.locations.set(l.uuid, l)
        if (!this.currentLocation) {
            this.currentLocation = l
        }
        return l
    }

    exterior(): WorldLocation {
        // TODO do this in a less hacky fashion
        return Array.from(this.locations.values()).filter(l => !l.isInterior)[0]
    }

    // transition(toUUID: string) {
    //     const location = this.locations.get(toUUID)
    //     this.currentLocation.dudes.delete(Player.instance.dude)
    //     location.dudes.add(Player.instance.dude)

    //     this.current = location
    // }

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
        result.currentLocation = result.locations.get(saveState.currentLocationUUID)
    }
}