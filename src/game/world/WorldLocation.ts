import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { Grid } from "../../engine/util/Grid"
import { PointAudio } from "../audio/PointAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { NPC } from "../characters/NPC"
import { Player } from "../characters/Player"
import { Lantern } from "../characters/weapons/Lantern"
import { ShieldType } from "../characters/weapons/ShieldType"
import { Camera } from "../cutscenes/Camera"
import { LocationSaveState } from "../saves/LocationSaveState"
import { newUUID } from "../saves/uuid"
import { HUD } from "../ui/HUD"
import { Barrier } from "./Barrier"
import { ElementComponent } from "./elements/ElementComponent"
import { Elements, ElementType, SavedElement } from "./elements/Elements"
import { ElementUtils } from "./elements/ElementUtils"
import { Ground, GroundType, SavedGround } from "./ground/Ground"
import { GroundComponent } from "./ground/GroundComponent"
import { LocationManager } from "./LocationManager"
import { MapGenerator } from "./MapGenerator"
import { StaticSprites } from "./StaticSprites"
import { Teleporter, TeleporterPrefix, Teleporters, TeleporterSound } from "./Teleporter"

export class WorldLocation {

    private _uuid: string = newUUID()
    get uuid() { return this._uuid }

    readonly dudes = new Set<Dude>()

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots 
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    private readonly elements = new Grid<ElementComponent>()
    private readonly occupied = new Grid<ElementComponent>()
    readonly ground = new Grid<GroundComponent>()

    // TODO: Make dropped items saveable
    readonly droppedItems = new Set<Entity>()

    private teleporters: { [key: string]: string } = {} 
    private barriers: Entity[] = []
    readonly sprites = new Entity().addComponent(new StaticSprites())

    readonly isInterior: boolean
    readonly allowPlacing: boolean

    constructor(isInterior: boolean, allowPlacing: boolean) {
        this.isInterior = isInterior
        this.allowPlacing = allowPlacing
    }

    setGroundElement(type: GroundType, pos: Point, data: object = {}): GroundComponent {
        this.ground.get(pos)?.entity.selfDestruct()
        const groundComponent = Ground.instance.make(type, this, pos, data)
        this.ground.set(pos, groundComponent)
        return groundComponent
    }

    /**
     * @param type 
     * @param pos tile point
     * @param data 
     */
    addElement(type: ElementType, pos: Point, data: object = {}): ElementComponent {
        const factory = Elements.instance.getElementFactory(type)
        const elementPts = ElementUtils.rectPoints(pos, factory.dimensions)
        if (elementPts.some(pt => !!this.elements.get(pt))) {
            return null
        }
        
        const el = factory.make(this, pos, data)
        if (el.type !== type) {
            throw new Error("constructed element type doesn't match requested type")
        } else if (el.pos !== pos) {
            throw new Error("constructed element position doesn't match requested position")
        } else if (!el.entity) {
            throw new Error("constructed element has a null entity")
        }

        elementPts.forEach(pt => this.elements.set(pt, el))
        el.occupiedPoints.forEach(pt => this.occupied.set(pt, el))
        
        return el
    }

    getElementsOfType(type: ElementType): ElementComponent[] {
        return this.elements.values().filter(el => el.type === type)
    }

    getElements() {
        return this.elements.values()
    }

    /**
     * @returns the element at the position. NOTE this can return an
     *          element even if this is an "empty" square
     */
    getElement(pos: Point) {
        return this.elements.get(pos)
    }

    /**
     * @returns true if this position in the grid has a solid item
     *          (aka it cannot be walked through)
     */
    isOccupied(pos: Point) {
        return !!this.occupied.get(pos)
    }

    removeElementAt(pos: Point) {
        this.removeElement(this.getElement(pos))
    }

    removeElement(el: ElementComponent) {
        this.elements.removeAll(el)
        this.occupied.removeAll(el)
    }

    getGroundSpots() {
        if (this.isInterior) {
            return this.ground.keys()
        }
        return MapGenerator.GOOD_FLEEING_SPOTS
    }

    findPath(tileStart: Point, tileEnd: Point, heuristic: (pt: Point, goal: Point) => number, shortCircuit: number) {
        return this.occupied.findPath(tileStart, tileEnd, {
            heuristic: (pt) => heuristic(pt, tileEnd),
            isOccupied: (pt) => {
                // Assuming this is used for character-to-character pathfinding, the start
                // and end points in the grid should be assumed to be open. For instance,
                // the character might be slightly in an "occupied" square, EG if they
                // are standing directly adjacent to the trunk of a tree.
                if (pt.equals(tileStart) || pt.equals(tileEnd)) {
                    return false
                }
                const buffer = 5
                if (pt.x < -MapGenerator.MAP_SIZE/2 - buffer || pt.x > MapGenerator.MAP_SIZE/2 + buffer
                        || pt.y < -MapGenerator.MAP_SIZE/2 - buffer || pt.y > MapGenerator.MAP_SIZE/2 + buffer) {
                    return true
                }
                return !!this.occupied.get(pt)
            },
            shortCircuit
        })
    }

    addTeleporter(t: Teleporter) {
        const teleporterId = Teleporters.teleporterId(t.to, t.id)
        this.teleporters[teleporterId] = t.pos.toString()
    }

    getTeleporter(toUUID: string) {
        return Object.entries(this.teleporters)
                .filter(kv => kv[0].startsWith(toUUID))
                .map(kv => ({
                    to: toUUID,
                    pos: Point.fromString(kv[1]),
                    id: Teleporters.getId(kv[0])
                }))[0]
    }

    private getTeleporterLinkedPos(to: string, id: string): Point {
        const dest = LocationManager.instance.get(to)
        const teleporterId = Teleporters.teleporterId(this.uuid, id)
        const link = dest.teleporters[teleporterId]
        if (!link) {
            throw new Error(`teleporter ${teleporterId} not found`)
        }
        return Point.fromString(link)
    }

    npcUseTeleporter(dude: Dude, teleporter: Teleporter) {
        const linkedLocation = LocationManager.instance.get(teleporter.to)
        const linkedPosition = this.getTeleporterLinkedPos(teleporter.to, teleporter.id)

        this.dudes.delete(dude)
        linkedLocation.dudes.add(dude)
        dude.location = linkedLocation

        const offset = dude.standingPosition.minus(dude.position)
        dude.moveTo(linkedPosition.minus(offset), true)
    }

    useTeleporter(to: string, id: string) {
        setTimeout(() => {
            // play a sound, if applicable
            if (id.startsWith(TeleporterPrefix.DOOR)) {
                Sounds.play(...TeleporterSound.DOOR)
            } else if (id.startsWith(TeleporterPrefix.TENT)) {
                Sounds.play(...TeleporterSound.TENT)
            } 
        }, 200);

        // load a new location
        HUD.instance.locationTransition.transition(() => {
            const linkedLocation = LocationManager.instance.get(to)
            const linkedPosition = this.getTeleporterLinkedPos(to, id)
            
            // move the player to the new location's dude store
            const p = Player.instance.dude
            const beforeTeleportPos = p.standingPosition
            this.dudes.delete(p)
            linkedLocation.dudes.add(p)
            p.location = linkedLocation

            // update carried light sources
            if (p.shieldType === ShieldType.LANTERN) {
                (p.shield as Lantern).removeLight()
            }

            // refresh the HUD hide stale data
            HUD.instance.refresh()
    
            // actually set the location
            LocationManager.instance.currentLocation = linkedLocation
    
            // fast-forward NPCs along their schedule
            linkedLocation.dudes.forEach(d => d.entity.getComponent(NPC)?.simulate())
    
            // position the player and camera
            const offset = p.standingPosition.minus(p.position)
            p.moveTo(linkedPosition.minus(offset), true)
            Camera.instance.jump(beforeTeleportPos.minus(p.standingPosition))
        })
    }

    setBarriers(barriers: Barrier[]) {
        this.barriers = barriers.map(b => b.entity || new Entity([b]))
    }

    getEntities() {
        return Array.from(Array.from(this.dudes.values()).map(d => d.entity))
                .concat(this.elements.values().map(c => c.entity))
                .concat(this.ground.values().filter(c => !c.tickExclude).map(c => c.entity))
                .concat(Array.from(this.droppedItems))
                .concat(this.barriers)
                .concat([this.sprites.entity])
    }

    getDude(dudeType: DudeType): Dude {
        return Array.from(this.dudes.values()).filter(d => d.type === dudeType)[0]
    }

    save(): LocationSaveState {
        return {
            uuid: this.uuid,
            ground: this.saveGround(),
            elements: this.saveElements(),
            dudes: Array.from(this.dudes).filter(d => d.isAlive && !!d.entity).map(d => d.save()),
            teleporters: this.teleporters,
            barriers: this.barriers.map(b => b.getComponent(Barrier).toJson()),
            staticSprites: this.sprites.toJson(),
            isInterior: this.isInterior,
            allowPlacing: this.allowPlacing,
        }
    }

    toggleAudio(active: boolean) {
        this.getEntities().flatMap(e => e.getComponents(PointAudio)).forEach(aud => aud.setActive(active))
    }

    private saveElements(): SavedElement[] {
        return this.elements.values().map(entity => {
            const el = new SavedElement()
            el.pos = entity.pos.toString()
            el.type = entity.type
            el.obj = entity.save()
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

    static load(saveState: LocationSaveState): WorldLocation {
        const n = new WorldLocation(saveState.isInterior, saveState.allowPlacing)
        n._uuid = saveState.uuid
        n.teleporters = saveState.teleporters
        n.barriers = saveState.barriers.map(b => Barrier.fromJson(b))
        n.sprites.fromJson(saveState.staticSprites)
        saveState.elements.forEach(el => n.addElement(el.type, Point.fromString(el.pos), el.obj))
        saveState.ground.forEach(el => n.setGroundElement(el.type, Point.fromString(el.pos), el.obj))
        saveState.dudes.forEach(d => DudeFactory.instance.load(d, n))
        n.toggleAudio(false)
        return n
    }
}