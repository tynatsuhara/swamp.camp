import { WorldLocation } from "./WorldLocation"
import { Player } from "../characters/Player"

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
        this.currentLocation.dynamic.delete(Player.instance.entity)
        to.dynamic.add(Player.instance.entity)

        this.current = to
    }
}