import { Grid } from "../../engine/util/Grid"
import { Entity } from "../../engine/Entity"
import { LocationSaveState } from "../saves/LocationSaveState"
import { newUUID } from "../saves/uuid"
import { ElementComponent } from "./elements/ElementComponent"
import { SavedElement, ElementType, Elements } from "./elements/Elements"
import { Point } from "../../engine/point"
import { LocationManager } from "./LocationManager"
import { GroundComponent } from "./ground/GroundComponent"
import { GroundType, Ground } from "./ground/Ground"

export class WorldLocation {

    readonly manager: LocationManager

    private _uuid: string = newUUID()
    get uuid() { return this._uuid }

    readonly ground = new Grid<GroundComponent>()

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots 
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    readonly elements = new Grid<ElementComponent>()

    // Entities with a dynamic position
    readonly dynamic = new Set<Entity>()

    constructor(manager: LocationManager) {
        this.manager = manager
    }

    addGroundElement(type: GroundType, pos: Point, ...args: any[]): GroundComponent {
        const groundComponent = Ground.instance.make(type, this, pos, ...args)
        if (!!this.ground.get(pos)) {
            groundComponent.entity.selfDestruct()
            return null
        }
        this.ground.set(pos, groundComponent)
        return groundComponent
    }

    addWorldElement(type: ElementType, pos: Point, ...args: any[]): ElementComponent {
        const elementComponent = Elements.instance.make(type, this, pos, ...args)
        if (elementComponent.occupiedPoints.some(pos => !!this.elements.get(pos))) {
            elementComponent.entity.selfDestruct()
            return null
        }
        elementComponent.occupiedPoints.forEach(pos => this.elements.set(pos, elementComponent))
        return elementComponent
    }

    getEntities() {
        return Array.from(new Set(this.ground.values().map(c => c.entity)))
                .concat(this.elements.values().map(c => c.entity))
                .concat(Array.from(this.dynamic))
    }

    save(): LocationSaveState {
        return {
            uuid: this.uuid,
            ground: null,  //this.ground.save()
            elements: this.saveElements(),
            dudes: null,  //Array.from()
        }
    }

    private saveElements(): SavedElement[] {
        const topLeftCornerMap = new Map<ElementComponent, Point>()  // TODO filter out duplicate entries

        this.elements.entries().forEach(tuple => {
            const elementComponent = tuple[1]
            const point = tuple[0]
            const existingPoint = topLeftCornerMap.get(elementComponent)
            if (!existingPoint || point.x < existingPoint.x || point.y < existingPoint.y) {
                topLeftCornerMap.set(elementComponent, point)
            }
        })

        return Array.from(topLeftCornerMap.entries()).map(kv => {
            const el = new SavedElement()
            el.pos = kv[1]
            el.type = kv[0].type
            el.obj = kv[0].save()
            return el
        })
    }

    static load(saveState: LocationSaveState): WorldLocation {
        const n = new WorldLocation(null)
        n._uuid = saveState.uuid
        // n.  TODO set this up
        return null
    }
}