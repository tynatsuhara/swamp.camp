import { Ambiance } from "../audio/Ambiance"
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
        window["locationManager"] = this
    }

    private _currentLocation: WorldLocation
    get currentLocation() { return this._currentLocation }
    set currentLocation(newLocation) {
        Ambiance.setIsInterior(newLocation.isInterior)
        this.currentLocation?.toggleAudio(false)
        newLocation.toggleAudio(true)
        this._currentLocation = newLocation
    }
    private locations: Map<string, WorldLocation> = new Map()  // uuid -> location

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    add(location: WorldLocation) {
        this.locations.set(location.uuid, location)
        if (!this.currentLocation) {
            this.currentLocation = location
        }
        return location
    }

    exterior(): WorldLocation {
        if (!this.ext) {
            // TODO do this in a less hacky fashion
            this.ext = Array.from(this.locations.values()).filter(l => !l.isInterior)[0]
        }
        return this.ext
    }
    private ext: WorldLocation

    getLocations(): WorldLocation[] {
        return Array.from(this.locations.values())
    }
    
    save(): LocationManagerSaveState {
        return {
            values: Array.from(this.locations.values()).map(l => l.save()),
            currentLocationUUID: this.currentLocation.uuid
        }
    }

    initialize(saveState: LocationManagerSaveState) {
        this.locations = new Map()
        saveState.values.forEach(l => {
            const loadedLocation = WorldLocation.load(l)
            this.locations.set(l.uuid, loadedLocation)
        })
        this.currentLocation = this.locations.get(saveState.currentLocationUUID)
    }
}