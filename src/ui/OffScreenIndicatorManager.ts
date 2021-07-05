import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { OffScreenIndicator } from "./OffScreenIndicator"

export class OffScreenIndicatorManager {

    private entity = new Entity()
    private map: Map<any, OffScreenIndicator> = new Map()

    addIndicator(key: any, positionSupplier: () => Point) {
        if (this.map.has(key)) {
            return
        }
        const c = this.entity.addComponent(new OffScreenIndicator(positionSupplier))
        this.map.set(key, c)
    }

    removeIndicator(key: any) {
        const c = this.map.get(key)
        if (!!c) {
            this.map.delete(key)
            this.entity.removeComponent(c)
        }
    }

    clear() {
        this.map.clear()
    }

    getEntity() {
        return this.entity
    }
}