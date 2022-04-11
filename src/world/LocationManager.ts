import { measure } from "brigsby/dist/Profiler"
import { WorldAudioContext } from "../audio/WorldAudioContext"
import { DudeType } from "../characters/DudeFactory"
import { LocationManagerSaveState } from "../saves/LocationManagerSaveState"
import { Singletons } from "../Singletons"
import { ElementType } from "./elements/Elements"
import { Location } from "./Location"
import { Simulatable } from "./Simulatable"
import { TimeUnit } from "./TimeUnit"

export enum LocationType {
    BASE_CAMP = "base",
    TENT_INTERIOR = "tent",
    MINE_INTERIOR = "mine",
    HOUSE_INTERIOR = "house",
    CHUCH_INTERIOR = "church",
    APOTHECARY_INTERIOR = "apothecary",
}

export class LocationManager {
    static get instance() {
        return Singletons.getOrCreate(LocationManager)
    }

    constructor() {
        window["locationManager"] = this
        window["showDudes"] = () => {
            const counts = {}
            here()
                .getDudes()
                .forEach((d) => {
                    const type = DudeType[d.type]
                    return (counts[type] = (counts[type] || 0) + 1)
                })
            console.log(counts)
        }
        window["bulldoze"] = (type: ElementType) => {
            here()
                .getElementsOfType(type)
                .forEach((el) => here().removeElement(el))
        }
    }

    /**
     * @deprecated use here() instead
     */
    current() {
        return this.currentLocation
    }
    loadLocation(newLocation: Location) {
        WorldAudioContext.instance.isInterior = newLocation.isInterior
        this.currentLocation?.toggleAudio(false)
        newLocation.toggleAudio(true)
        this.currentLocation = newLocation
        this.simulateLocations(false, TimeUnit.MINUTE)
    }
    private currentLocation: Location

    private locations: Map<string, Location> = new Map() // uuid -> location

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    add(location: Location) {
        this.locations.set(location.uuid, location)
        if (!this.currentLocation) {
            this.loadLocation(location)
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
        this.loadLocation(this.locations.get(saveState.currentLocationUUID))
    }

    simulateLocations(simulateCurrentLocation: boolean, duration: number) {
        const [time] = measure(() => {
            this.getLocations()
                .filter((l) => simulateCurrentLocation || l !== this.currentLocation)
                .flatMap((l) => l.getEntities())
                .forEach((e) => e.getComponents(Simulatable).forEach((s) => s.simulate(duration)))
        })
        // console.log(`simulation took ${time} milliseconds`)
    }
}

export const camp = () => LocationManager.instance.exterior()
export const here = () => LocationManager.instance.current()
