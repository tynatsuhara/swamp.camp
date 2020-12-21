import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"
import { WorldLocation } from "./WorldLocation"

export class LocationManager {
    
    private static _instance: LocationManager
    static get instance(): LocationManager {
        if (!this._instance) {
            this._instance = new LocationManager()
        }
        return this._instance
    }

    private constructor() {
        LocationManager._instance = this
    }

    currentLocation: WorldLocation
    private locations: Map<string, WorldLocation> = new Map()  // uuid -> location

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    newLocation(isInterior: boolean) {
        const l = new WorldLocation(isInterior)
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

    getLocations(): WorldLocation[] {
        return Array.from(this.locations.values())
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

    initialize(saveState: LocationManagerSaveState) {
        this.locations = new Map()
        saveState.locations.forEach(l => {
            const loadedLocation = WorldLocation.load(l)
            this.locations.set(l.uuid, loadedLocation)
        })
        this.currentLocation = this.locations.get(saveState.currentLocationUUID)
    }
}