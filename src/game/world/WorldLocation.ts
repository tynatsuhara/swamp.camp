import { Grid } from "../../engine/util/Grid"
import { Entity } from "../../engine/Entity"
import { LocationSaveState } from "../saves/LocationSaveState"
import { newUUID } from "../saves/uuid"
import { ElementComponent } from "./elements/ElementComponent"
import { SavedElement, ElementType, Elements } from "./elements/Elements"
import { Point } from "../../engine/point"
import { LocationManager } from "./LocationManager"
import { GroundComponent } from "./ground/GroundComponent"
import { GroundType, Ground, SavedGround } from "./ground/Ground"
import { Dude } from "../characters/Dude"

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

    readonly dudes = new Set<Dude>()

    // TODO: Make dropped items saveable
    readonly droppedItems = new Set<Entity>()

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
                .concat(Array.from(this.dudes.values()).map(d => d.entity))
                .concat(Array.from(this.droppedItems))
    }

    save(): LocationSaveState {
        return {
            uuid: this.uuid,
            ground: this.saveGround(),
            elements: this.saveElements(),
            dudes: null,  //Array.from()
        }
    }

    private saveElements(): SavedElement[] {
        const topLeftCornerMap = new Map<ElementComponent, Point>()

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

    private saveGround(): SavedGround[] {
        return this.ground.entries().map(kv => {
            const el = new SavedGround()
            el.pos = kv[0]
            el.type = kv[1].type
            el.obj = kv[1].save()
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