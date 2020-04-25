import { WorldLocation } from "./WorldLocation"

export class LocationManager {
    
    static instance: LocationManager

    private current: WorldLocation
    get currentLocation() {
        return this.current
    }

    constructor(startingLocation: WorldLocation) {
        LocationManager.instance = this
        this.current = startingLocation
    }

    transition(to: WorldLocation) {
        this.current = to
        // TODO
    }
}