import { Entity, Point } from "brigsby/dist"
import { Location } from "../world/locations/Location"
import { OffScreenIndicator } from "./OffScreenIndicator"

export class OffScreenIndicatorManager {
    private entity = new Entity()
    private map: Map<any, OffScreenIndicator> = new Map()

    addIndicator(key: any, positionSupplier: () => Point, locationSupplier: () => Location) {
        if (this.map.has(key)) {
            return
        }
        const c = this.entity.addComponent(
            new OffScreenIndicator(positionSupplier, locationSupplier)
        )
        this.map.set(key, c)
    }

    removeIndicator(key: any) {
        const c = this.map.get(key)
        if (!!c) {
            this.map.delete(key)
            this.entity.removeComponent(c)
        }
    }

    getMarkedLocations() {
        return [...this.map.values()].map((i) => i.locationSupplier())
    }

    getEntity() {
        return this.entity
    }
}
