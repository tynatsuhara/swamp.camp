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
import { DudeFactory } from "../characters/DudeFactory"
import { Teleporter, Teleporters } from "./Teleporter"
import { Player } from "../characters/Player"
import { PointLightMaskRenderer } from "./PointLightMaskRenderer"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { NPC } from "../characters/NPC"

export class WorldLocation {

    readonly manager: LocationManager

    private _uuid: string = newUUID()
    get uuid() { return this._uuid }

    readonly dudes = new Set<Dude>()

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots 
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    readonly elements = new Grid<ElementComponent>()
    readonly ground = new Grid<GroundComponent>()

    // TODO: Make dropped items saveable
    readonly droppedItems = new Set<Entity>()

    private teleporters: { [key: string]: string } = {} 

    readonly isInterior: boolean;

    constructor(manager: LocationManager, isInterior: boolean) {
        this.manager = manager
        this.isInterior = isInterior
    }

    addGroundElement(type: GroundType, pos: Point, data: object = {}): GroundComponent {
        const groundComponent = Ground.instance.make(type, this, pos, data)
        if (!!this.ground.get(pos)) {
            groundComponent.entity.selfDestruct()
            return null
        }
        this.ground.set(pos, groundComponent)
        return groundComponent
    }

    addWorldElement(type: ElementType, pos: Point, data: object = {}): ElementComponent {
        const elementComponent = Elements.instance.make(type, this, pos, data)
        if (elementComponent.occupiedPoints.some(pos => !!this.elements.get(pos))) {
            elementComponent.entity.selfDestruct()
            return null
        }
        elementComponent.occupiedPoints.forEach(pos => this.elements.set(pos, elementComponent))
        return elementComponent
    }

    addTeleporter(t: Teleporter) {
        this.teleporters[Teleporters.teleporterId(t.to, t.id)] = t.pos.toString()
    }

    private getTeleporterLinkedPos(to: string, id: string): Point {
        const dest = LocationManager.instance.get(to)
        const link = dest.teleporters[Teleporters.teleporterId(this.uuid, id)]
        if (!link) {
            throw new Error("teleporter doesn't have a link on the other side")
        }
        return Point.fromString(link)
    }

    useTeleporter(to: string, id: string = null) {
        const linkedLocation = LocationManager.instance.get(to)
        const linkedPosition = this.getTeleporterLinkedPos(to, id)
        
        const p = Player.instance.dude
        const beforeTeleportPos = p.standingPosition
        this.dudes.delete(p)
        linkedLocation.dudes.add(p)

        LocationManager.instance.currentLocation = linkedLocation

        // fast-forward NPCs along their schedule
        linkedLocation.dudes.forEach(d => d.entity.getComponent(NPC)?.simulate())

        // move player
        const offset = p.standingPosition.minus(p.position)
        p.moveTo(linkedPosition.minus(offset))

        // makes the camera lerp a bit in the direction of the door
        // TODO make this support non up/down doors
        const niceTransition = TILE_SIZE * 2 * (linkedLocation.isInterior ? -1 : 1)
        
        Camera.instance.jump(beforeTeleportPos.minus(p.standingPosition).plusY(niceTransition))
    }

    getEntities() {
        return Array.from(Array.from(this.dudes.values()).map(d => d.entity))
                .concat(this.elements.values().map(c => c.entity))
                .concat(this.ground.values().map(c => c.entity))
                .concat(Array.from(this.droppedItems))
    }

    save(): LocationSaveState {
        return {
            uuid: this.uuid,
            ground: this.saveGround(),
            elements: this.saveElements(),
            dudes: Array.from(this.dudes).filter(d => d.isAlive && !!d.entity).map(d => d.save()),
            teleporters: this.teleporters,
            isInterior: this.isInterior
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
            el.pos = kv[1].toString()
            el.type = kv[0].type
            el.obj = kv[0].save()
            return el
        })
    }

    private saveGround(): SavedGround[] {
        return this.ground.entries().map(kv => {
            const el = new SavedGround()
            el.pos = kv[0].toString()
            el.type = kv[1].type
            el.obj = kv[1].save()
            return el
        })
    }

    static load(locationManager: LocationManager, saveState: LocationSaveState): WorldLocation {
        // BUG: RELOADING RETURNS ELEMENTS THAT HAVE BEEN DESTROYED
        const n = new WorldLocation(locationManager, saveState.isInterior)
        n._uuid = saveState.uuid
        saveState.elements.forEach(el => n.addWorldElement(el.type, Point.fromString(el.pos), el.obj))
        saveState.ground.forEach(el => n.addGroundElement(el.type, Point.fromString(el.pos), el.obj))
        saveState.dudes.forEach(d => DudeFactory.instance.load(d, n))
        n.teleporters = saveState.teleporters
        return n
    }
}