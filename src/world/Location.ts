import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Grid } from "brigsby/dist/util/Grid"
import { PointAudio } from "../audio/PointAudio"
import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { Player } from "../characters/Player"
import { Camera } from "../cutscenes/Camera"
import { CutscenePlayerController } from "../cutscenes/CutscenePlayerController"
import { Particles } from "../graphics/Particles"
import { LocationSaveState } from "../saves/LocationSaveState"
import { newUUID } from "../saves/uuid"
import { HUD } from "../ui/HUD"
import { Barrier } from "./Barrier"
import { ElementComponent } from "./elements/ElementComponent"
import { Elements, ElementType, SavedElement } from "./elements/Elements"
import { ElementUtils } from "./elements/ElementUtils"
import { Ground, GroundType, SavedGround } from "./ground/Ground"
import { GroundComponent } from "./ground/GroundComponent"
import { LocationManager, LocationType } from "./LocationManager"
import { StaticSprites } from "./StaticSprites"
import { Teleporter, TeleporterPrefix, Teleporters, TeleporterSound } from "./Teleporter"

export class Location {
    private _uuid: string = newUUID()
    get uuid() {
        return this._uuid
    }

    readonly type: LocationType

    readonly dudes = new Set<Dude>()

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    private readonly elements = new Grid<ElementComponent>()
    private readonly occupied = new Grid<ElementComponent>()
    private readonly ground = new Grid<GroundComponent>()
    readonly levels = new Grid<number>()

    // TODO: Make dropped items saveable
    readonly droppedItems = new Set<Entity>()

    private teleporters: { [key: string]: string } = {}
    private barriers: Entity[] = []
    readonly sprites = new Entity().addComponent(new StaticSprites())

    readonly size: number // tile dimensions (square)
    readonly isInterior: boolean
    readonly allowPlacing: boolean

    /**
     * @param isInterior if it's an inside location
     * @param allowPlacing if the user can place elements here
     * @param size the size of the location in tiles (square), can be omitted for interiors
     */
    constructor(
        type: LocationType,
        isInterior: boolean,
        allowPlacing: boolean,
        size?: number,
        levels?: Grid<number>
    ) {
        this.type = type
        this.isInterior = isInterior
        this.allowPlacing = allowPlacing
        this.size = size
        this.levels = levels
    }

    setGroundElement(type: GroundType, pos: Point, data: object = {}): GroundComponent {
        this.ground.get(pos)?.entity.selfDestruct()
        const groundComponent = Ground.instance.make(type, this, pos, data)
        this.ground.set(pos, groundComponent)

        if (!this.isInterior) {
            HUD.instance.miniMap.refresh()
        }

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
        if (elementPts.some((pt) => !!this.elements.get(pt))) {
            return null
        }

        if (!factory.canPlaceAtPos(this, pos)) {
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

        // stake the element's claim for the land
        elementPts.forEach((pt) => this.elements.set(pt, el))

        // mark points as occupied for pathfinding, etc
        el.occupiedPoints.forEach((pt) => {
            this.occupied.set(pt, el)
            // reset the ground in order to handle things like flattening tall grass
            const groundData = this.ground.get(pt)
            if (groundData) {
                this.setGroundElement(groundData.type, pt, groundData.save())
            }
        })

        if (!this.isInterior) {
            HUD.instance.miniMap.refresh()
        }

        return el
    }

    getElementsOfType(type: ElementType): ElementComponent[] {
        return this.elements.values().filter((el) => el.type === type)
    }

    getElements() {
        return this.elements.values()
    }

    /**
     * @returns the element component at the position. NOTE this can return an
     *          element even if this is an "empty" square
     */
    getElement(pos: Point) {
        return this.elements.get(pos)
    }

    /**
     * @returns the ground component at the position
     */
    getGround(pos: Point) {
        return this.ground.get(pos)
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

        if (!this.isInterior) {
            HUD.instance.miniMap.refresh()
        }
    }

    /**
     * @returns All the reasonable ground spots in the location.
     *          For exterior locations, excludes the very edge of the map.
     */
    getGroundSpots(forceGetAll = false) {
        if (this.isInterior || forceGetAll) {
            return this.ground.keys()
        }
        return this.exteriorFleeingSpots()
    }

    private exteriorFleeingSpotsCache: Point[]
    private exteriorFleeingSpots(): Point[] {
        if (this.exteriorFleeingSpotsCache) {
            return this.exteriorFleeingSpotsCache
        }
        const range = this.size / 2 - 8 // don't run right to the edge of the map
        const possibilities = []
        for (let x = -range; x < range; x++) {
            for (let y = -range; y < range; y++) {
                possibilities.push(new Point(x, y))
            }
        }
        this.exteriorFleeingSpotsCache = possibilities
        return possibilities
    }

    /**
     * @param isOccupied a function which returns true if the pt cannot be included in a path
     *                   (in addition to points which are globally occupied)
     */
    findPath(
        tileStart: Point,
        tileEnd: Point,
        heuristic: (pt: Point, goal: Point) => number,
        isOccupied: (pt: Point) => boolean
    ) {
        const buffer = 5
        const range = this.size / 2 + buffer

        const isOutsideRange = (pt: Point) => {
            return pt.x < -range || pt.x > range || pt.y < -range || pt.y > range
        }

        const shouldCheckRange = !(isOutsideRange(tileStart) || isOutsideRange(tileEnd))

        return this.occupied.findPath(tileStart, tileEnd, {
            heuristic: (pt) => heuristic(pt, tileEnd),
            distance: (a, b) => {
                const type = this.getGround(b)?.type
                return type === GroundType.LEDGE || Ground.isWater(type) ? 3 : 1
            },
            isOccupied: (pt) => {
                // Assuming this is used for character-to-character pathfinding, the start
                // and end points in the grid should be assumed to be open. For instance,
                // the character might be slightly in an "occupied" square, EG if they
                // are standing directly adjacent to the trunk of a tree.
                if (pt.equals(tileStart) || pt.equals(tileEnd)) {
                    return false
                }
                if (shouldCheckRange && isOutsideRange(pt)) {
                    return true
                }
                return !!this.occupied.get(pt) || isOccupied(pt)
            },
        })
    }

    addTeleporter(t: Teleporter) {
        const teleporterId = Teleporters.teleporterId(t.to, t.id)
        this.teleporters[teleporterId] = t.pos.toString()
    }

    getTeleporter(toUUID: string) {
        return Object.entries(this.teleporters)
            .filter((kv) => kv[0].startsWith(toUUID))
            .map((kv) => ({
                to: toUUID,
                pos: Point.fromString(kv[1]),
                id: Teleporters.getId(kv[0]),
            }))[0]
    }

    getTeleporterLocations() {
        return Object.entries(this.teleporters).map((kv) => Point.fromString(kv[1]))
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
        CutscenePlayerController.instance.enable()

        setTimeout(() => {
            // play a sound, if applicable
            if (id.startsWith(TeleporterPrefix.DOOR)) {
                Sounds.play(...TeleporterSound.DOOR)
            } else if (id.startsWith(TeleporterPrefix.TENT)) {
                Sounds.play(...TeleporterSound.TENT)
            }
        }, 500)

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

            // refresh the HUD hide stale data
            HUD.instance.refresh()

            // actually set the location
            LocationManager.instance.currentLocation = linkedLocation

            // delete existing particles
            Particles.instance.clear()

            // position the player and camera
            const offset = p.standingPosition.minus(p.position)
            p.moveTo(linkedPosition.minus(offset), true)
            Camera.instance.jump(beforeTeleportPos.minus(p.standingPosition))

            setTimeout(() => {
                CutscenePlayerController.instance.disable()
            }, 400)
        })
    }

    setBarriers(barriers: Barrier[]) {
        this.barriers = barriers.map((b) => b.entity || new Entity([b]))
    }

    getEntities() {
        return Array.from(Array.from(this.dudes.values()).map((d) => d.entity))
            .concat(this.elements.values().map((c) => c.entity))
            .concat(
                this.ground
                    .values()
                    .filter((c) => !c.tickExclude)
                    .map((c) => c.entity)
            )
            .concat(Array.from(this.droppedItems))
            .concat(this.barriers)
            .concat([this.sprites.entity])
    }

    getDude(dudeType: DudeType): Dude {
        return Array.from(this.dudes.values()).filter((d) => d.type === dudeType)[0]
    }

    save(): LocationSaveState {
        return {
            uuid: this.uuid,
            type: this.type,
            ground: this.saveGround(),
            elements: this.saveElements(),
            dudes: Array.from(this.dudes)
                .filter((d) => d.isAlive && !!d.entity)
                .map((d) => d.save()),
            teleporters: this.teleporters,
            barriers: this.barriers.map((b) => b.getComponent(Barrier).toJson()),
            staticSprites: this.sprites.toJson(),
            isInterior: this.isInterior,
            allowPlacing: this.allowPlacing,
            size: this.size,
            levels: this.levels?.serialize(),
        }
    }

    toggleAudio(active: boolean) {
        this.getEntities()
            .flatMap((e) => e.getComponents(PointAudio))
            .forEach((aud) => aud.setActive(active))
    }

    private saveElements(): SavedElement[] {
        return this.elements.values().map((entity) => {
            const el = new SavedElement()
            el.pos = entity.pos.toString()
            el.type = entity.type
            el.obj = entity.save()
            return el
        })
    }

    private saveGround(): SavedGround[] {
        return this.ground.entries().map((kv) => {
            const el = new SavedGround()
            el.pos = kv[0].toString()
            el.type = kv[1].type
            el.obj = kv[1].save()
            return el
        })
    }

    static load(saveState: LocationSaveState): Location {
        // previously we did not save location size
        const size = saveState.size || (saveState.isInterior ? null : 70)
        const levels = saveState.levels ? Grid.deserialize(saveState.levels) : null

        const n = new Location(
            saveState.type,
            saveState.isInterior,
            saveState.allowPlacing,
            size,
            levels
        )

        n._uuid = saveState.uuid
        n.teleporters = saveState.teleporters
        n.barriers = saveState.barriers.map((b) => Barrier.fromJson(b))
        n.sprites.fromJson(saveState.staticSprites)
        saveState.ground.forEach((el) =>
            n.setGroundElement(el.type, Point.fromString(el.pos), el.obj)
        )
        saveState.elements.forEach((el) => n.addElement(el.type, Point.fromString(el.pos), el.obj))
        saveState.dudes.forEach((d) => DudeFactory.instance.load(d, n))
        n.toggleAudio(false)

        return n
    }
}
