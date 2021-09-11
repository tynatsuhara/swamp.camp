import { Point } from "brigsby/dist/Point"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { NPC } from "../characters/NPC"
import { TILE_SIZE } from "../graphics/Tilesets"
import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"
import { Singletons } from "../Singletons"
import { WorldLocation } from "./WorldLocation"

export class LocationManager {
    
    static get instance() {
        return Singletons.getOrCreate(LocationManager)
    }

    constructor() {
        window["locationManager"] = this
    }

    private _currentLocation: WorldLocation
    get currentLocation() { return this._currentLocation }
    set currentLocation(newLocation) {
        WorldAudioContext.instance.isInterior = newLocation.isInterior
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

    exteriorEntrancePosition() {
        return new Point(1, 1).times(this.exterior().size/2 * TILE_SIZE)
                .plusX(TILE_SIZE * 2)
                .plusY(-TILE_SIZE * 25)
    }

    simulateLocations(simulateCurrentLocation: boolean) {
        this.getLocations()
            .filter(l => simulateCurrentLocation || l !== this.currentLocation)
            .flatMap(l => Array.from(l.dudes))
            .forEach(d => d.entity.getComponent(NPC)?.simulate())
    }
}