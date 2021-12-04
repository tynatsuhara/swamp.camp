import { Point } from "brigsby/dist/Point"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { DudeType } from "../characters/DudeFactory"
import { NPC } from "../characters/NPC"
import { TILE_SIZE } from "../graphics/Tilesets"
import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"
import { Singletons } from "../Singletons"
import { Location } from "./Location"

export enum LocationType {
    BASE_CAMP = "base",
    TENT_INTERIOR = "tent",
    MINE_INTERIOR = "mine",
    HOUSE_INTERIOR = "house",
}

export class LocationManager {
    static get instance() {
        return Singletons.getOrCreate(LocationManager)
    }

    constructor() {
        window["locationManager"] = this
        window["showDudes"] = () => {
            const counts = {}
            Array.from(LocationManager.instance.currentLocation.dudes.values()).forEach((d) => {
                const type = DudeType[d.type]
                return (counts[type] = (counts[type] || 0) + 1)
            })
            console.log(counts)
        }
    }

    private _currentLocation: Location
    get currentLocation() {
        return this._currentLocation
    }
    set currentLocation(newLocation) {
        WorldAudioContext.instance.isInterior = newLocation.isInterior
        this.currentLocation?.toggleAudio(false)
        newLocation.toggleAudio(true)
        this._currentLocation = newLocation
    }
    private locations: Map<string, Location> = new Map() // uuid -> location

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    add(location: Location) {
        this.locations.set(location.uuid, location)
        if (!this.currentLocation) {
            this.currentLocation = location
        }
        return location
    }

    /**
     * @deprecated use camp() instead
     */
    exterior(): Location {
        if (!this.ext) {
            // TODO do this in a less hacky fashion
            this.ext = Array.from(this.locations.values()).find(
                (l) => l.type === LocationType.BASE_CAMP
            )
        }
        return this.ext
    }
    private ext: Location

    getLocations(): Location[] {
        return Array.from(this.locations.values())
    }

    save(): LocationManagerSaveState {
        return {
            values: Array.from(this.locations.values()).map((l) => l.save()),
            currentLocationUUID: this.currentLocation.uuid,
        }
    }

    initialize(saveState: LocationManagerSaveState) {
        this.locations = new Map()
        saveState.values.forEach((l) => {
            const loadedLocation = Location.load(l)
            this.locations.set(l.uuid, loadedLocation)
        })
        this.currentLocation = this.locations.get(saveState.currentLocationUUID)
    }

    exteriorEntrancePosition() {
        return new Point(1, 1)
            .times((this.exterior().size / 2) * TILE_SIZE)
            .plusX(TILE_SIZE * 2)
            .plusY(-TILE_SIZE * 25)
    }

    simulateLocations(simulateCurrentLocation: boolean) {
        this.getLocations()
            .filter((l) => simulateCurrentLocation || l !== this.currentLocation)
            .flatMap((l) => Array.from(l.dudes))
            .forEach((d) => d.entity.getComponent(NPC)?.simulate())
    }
}

export const camp = () => LocationManager.instance.exterior()
