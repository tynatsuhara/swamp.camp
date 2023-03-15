import { Entity, Point, pt } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { Grid } from "brigsby/dist/util"
import { Sounds } from "../../audio/Sounds"
import { Dude } from "../../characters/Dude"
import { DudeFactory } from "../../characters/DudeFactory"
import { DudeType } from "../../characters/DudeType"
import { DroppedItem } from "../../items/DroppedItem"
import { session } from "../../online/session"
import { ONLINE_PLAYER_DUDE_ID_PREFIX, syncFn } from "../../online/syncUtils"
import { SaveContext } from "../../SaveManager"
import { LocationSaveState } from "../../saves/LocationSaveState"
import { newUUID } from "../../saves/uuid"
import { HUD } from "../../ui/HUD"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementDataFormat, Elements, ElementType, SavedElement } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Feature, FeatureData, FeatureType, instantiateFeature } from "../features/Features"
import { Ground, GroundType, SavedGround } from "../ground/Ground"
import { GroundComponent } from "../ground/GroundComponent"
import { Teleporter, TeleporterPrefix, Teleporters, TeleporterSound } from "../Teleporter"
import { Location } from "./Location"
import { LocationManager } from "./LocationManager"
import { LocationType } from "./LocationType"

export class BasicLocation extends Location {
    readonly uuid: string

    readonly type: LocationType

    private readonly dudes = new Set<Dude>()

    // Non-moving entities with tile coords (not pixel coords)
    // Entities may be duplicated in multiple spots
    // (entities spawning multiple tiles eg a tent)
    // BUT an entity should only be in one of these data structures
    private readonly elements = new Grid<ElementComponent<any>>()
    private readonly occupied = new Grid<boolean>()
    private readonly ground = new Grid<GroundComponent>()
    readonly levels = new Grid<number>()

    // TODO: Make dropped items saveable
    private readonly droppedItems = new Set<DroppedItem>()

    private features: Feature<any>[] = []
    private readonly featureEntities: Entity[] = []
    private teleporters: { [key: string]: string } = {}

    // private readonly syncListeners = new Map<string, (...args: any[]) => void>()
    private readonly syncFunctions = new Map<string, (...args: any[]) => void>()

    readonly size: number // tile dimensions (square)
    get range() {
        return this.size / 2
    }
    readonly isInterior: boolean
    readonly allowPlacing: boolean

    /**
     * @param isInterior if it's an inside location
     * @param allowPlacing if the user can place elements here
     * @param size the size of the location in tiles (square), can be omitted for interiors
     */
    constructor({
        type,
        isInterior,
        allowPlacing,
        size,
        levels,
        uuid = newUUID(),
    }: {
        type: LocationType
        isInterior: boolean
        allowPlacing: boolean
        size?: number
        levels?: Grid<number>
        uuid?: string
    }) {
        super()

        this.type = type
        this.isInterior = isInterior
        this.allowPlacing = allowPlacing
        this.size = size
        this.levels = levels
        this.uuid = uuid

        const syncId = this.uuid.substring(0, 8)
        this.syncLoadElement = syncFn(`${syncId}le`, (...args) => {
            if (session.isGuest()) {
                console.log("sync load element")
                return this.loadElement(...args)
            }
        })

        // syncElement is a central syncFn which redirects data to elements that have registed callbacks
        this.syncElement = syncFn(`${syncId}se`, <T extends any[]>(id: string, ...args: T) => {
            const syncFn = this.syncFunctions.get(id)
            if (syncFn) {
                syncFn(...args)
            } else {
                console.warn("unexpected element syncFn called")
            }
        })

        this.removeElementAt = syncFn(`${syncId}rma`, (x: number, y: number) => {
            this.removeElementLocally(this.getElement(pt(x, y)))
        })
    }

    /**
     * @returns A syncFn which will properly redirects data to elements based on grid position.
     */
    elementSyncFn<T extends any[]>(
        namespace: string,
        { x, y }: Point,
        fn: (...args: T) => void
    ): (...args: T) => void {
        const id = `${pt(x, y).toString()}:${namespace}`
        // store the function in a map based on x/y so that it can be looked up client side
        this.syncFunctions.set(id, fn)
        // return a sync function which binds the x/y coords
        return (...args: T) => this.syncElement(id, ...args)
    }

    private syncElement: <T extends any[]>(id: string, ...args: T) => void

    // /**
    //  * @returns A syncFn which will properly
    //  */
    // elementAction<T extends any>({
    //     x,
    //     y,
    // }: Point): [(...args: T[]) => void, (listener: (...args: T[]) => void) => void] {
    //     const [sendElementSync, receiveElementSync] = session.cachedAction("elem:sync")
    //     const sendWrapper = <T extends any[]>(...data: T) => {
    //         if (session.isGuest()) {
    //             console.warn("guests can't send element data")
    //         } else {
    //             sendElementSync(data, null, { x, y })
    //         }
    //     }
    //     const receiveWrapper = <T extends any[]>(fn: (...args: T) => void) => {
    //         if (session.isGuest()) {
    //             this.syncListeners.set(pt.toString(), fn)
    //         }
    //     }
    //     receiveElementSync((data, _, { x, y }: { x: number; y: number }) => {
    //         const listener = this.syncListeners.get(pt(x, y).toString())
    //         listener(data)
    //     })
    //     return [sendWrapper, receiveWrapper]
    // }
    private dudeCache: Dude[]
    getDudes() {
        if (!this.dudeCache) {
            this.dudeCache = Array.from(this.dudes)
        }
        return this.dudeCache
    }

    addDude(dude: Dude) {
        this.dudes.add(dude)
        this.dudeCache = undefined
    }

    removeDude(dude: Dude) {
        this.dudes.delete(dude)
        this.dudeCache = undefined
    }

    setGroundElement(type: GroundType, tilePoint: Point, data: object = {}): GroundComponent {
        this.ground.get(tilePoint)?.entity.selfDestruct()
        const groundComponent = Ground.instance.make(type, this, tilePoint, data)
        this.ground.set(tilePoint, groundComponent)

        if (!this.isInterior) {
            HUD.instance.miniMap.refresh()
        }

        return groundComponent
    }

    reloadElement(tile: Point) {
        const element = this.getElement(tile)
        if (!element) {
            return
        }
        const type = element.type
        const data = element.save()
        this.removeElementAt(tile.x, tile.y)
        this.addElement(type, tile, data)
    }

    /**
     * Should only be called on hosts!
     */
    addElement<T extends ElementType>(
        type: T,
        tilePoint: PointValue,
        data: Partial<ElementDataFormat[T]> = {}
    ): ElementComponent<T, ElementDataFormat[T]> {
        if (!session.isHost()) {
            console.warn("addElement cannot be called by guest!")
            return null
        }

        const ptString = pt(tilePoint.x, tilePoint.y).toString()

        // On the host, create the element
        const element = this.loadElement(type, ptString, data)

        if (!element) {
            return null
        }

        this.syncLoadElement(type, ptString, element.save())

        return element
    }

    private syncLoadElement: typeof this.loadElement

    /**
     * The same as addElement, except that it can be called by guests during their initial load-in
     */
    private loadElement<T extends ElementType>(
        type: T,
        tilePointString: string,
        data: Partial<ElementDataFormat[T]> = {}
    ): ElementComponent<T, ElementDataFormat[T]> {
        const tilePoint = Point.fromString(tilePointString)

        const factory = Elements.instance.getElementFactory(type)
        const elementPts = ElementUtils.rectPoints(tilePoint, factory.dimensions)
        if (elementPts.some((pt) => !!this.elements.get(pt))) {
            return null
        }

        if (!factory.canPlaceAtPos(this, tilePoint)) {
            return null
        }

        const el = factory.make(this, tilePoint, data)
        if (el.type !== type) {
            throw new Error("constructed element type doesn't match requested type")
        } else if (el.pos !== tilePoint) {
            throw new Error("constructed element position doesn't match requested position")
        } else if (!el.entity) {
            throw new Error("constructed element has a null entity")
        }

        // stake the element's claim for the land
        elementPts.forEach((pt) => {
            this.elements.set(pt, el)
            if (el === null) {
                console.error(`null element of type ${ElementType[type]}`)
            }
            // reset the ground in order to handle things like flattening tall grass
            const groundData = this.ground.get(pt)
            if (groundData) {
                this.setGroundElement(groundData.type, pt, groundData.save())
            }
        })

        if (!this.isInterior) {
            HUD.instance.miniMap.refresh()
        }

        return el as ElementComponent<T, ElementDataFormat[T]>
    }

    /**
     * @returns the first element found of the given type, or undefined if none exist
     */
    getElementOfType<T extends ElementType>(
        type: T
    ): ElementComponent<T, ElementDataFormat[T]> | undefined {
        return this.elements.values().find((el) => el.type === type)
    }

    getElementsOfType<T extends ElementType>(type: T): ElementComponent<T, ElementDataFormat[T]>[] {
        return this.elements.values().filter((el) => el.type === type)
    }

    getElements(): ElementComponent<any>[] {
        return this.elements.values()
    }

    /**
     * @returns the element component at the position. NOTE this can return an
     *          element even if this is an "empty" square
     */
    getElement(tilePoint: Point) {
        return this.elements.get(tilePoint)
    }

    /**
     * @returns the ground component at the position
     */
    getGround(tilePoint: Point) {
        return this.ground.get(tilePoint)
    }

    /**
     * @returns true if this position in the grid has a solid item
     *          (aka it cannot be walked through)
     */
    isOccupied(tilePoint: Point) {
        return !!this.occupied.get(tilePoint)
    }

    setOccupied(tilePoint: Point, occupied: boolean) {
        if (occupied) {
            this.occupied.set(tilePoint, true)
        } else {
            this.occupied.remove(tilePoint)
        }
    }

    getOccupiedSpots() {
        return this.occupied.keys()
    }

    /**
     * synced host->client
     */
    removeElementAt: (x: number, y: number) => void

    removeElementLocally(el: ElementComponent<any>) {
        if (!el) {
            return
        }

        for (const syncFn of this.syncFunctions.keys()) {
            const pos = Point.fromString(syncFn.split(":")[0])
            if (pos.equals(el.pos)) {
                this.syncFunctions.delete(syncFn)
            }
        }

        if (this.elements.get(el.pos) === el) {
            this.elements.removeAll(el)
            ElementUtils.rectPoints(
                el.pos,
                Elements.instance.getElementFactory(el.type).dimensions
            ).forEach((pos) => this.setOccupied(pos, false))

            if (!this.isInterior) {
                HUD.instance.miniMap.refresh()
            }
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
     * @param extraIsOccupiedFilter a function which returns true if the pt cannot be included in a path
     *                   (in addition to points which are globally occupied)
     */
    findPath(
        tileStart: Point,
        tileEnd: Point,
        heuristic: (pt: Point, goal: Point) => number,
        extraIsOccupiedFilter: (pt: Point) => boolean,
        distance: (a: Point, b: Point) => number
    ): Point[] {
        const buffer = 5
        const range = this.size / 2 + buffer

        const isOutsideRange = (pt: Point) => {
            return pt.x < -range || pt.x > range || pt.y < -range || pt.y > range
        }

        const shouldCheckRange = !(isOutsideRange(tileStart) || isOutsideRange(tileEnd))

        return this.occupied.findPath(tileStart, tileEnd, {
            heuristic: (pt) => heuristic(pt, tileEnd),
            distance,
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
                if (this.isInterior && !this.ground.get(pt)) {
                    return true
                }
                return this.occupied.get(pt) || extraIsOccupiedFilter(pt)
            },
        })
    }

    addTeleporter(t: Teleporter): void {
        const teleporterId = Teleporters.teleporterId(t.to, t.id)
        this.teleporters[teleporterId] = t.pos.toString()
    }

    getTeleporter(toUUID: string): Teleporter {
        return Object.entries(this.teleporters)
            .filter((kv) => kv[0].startsWith(toUUID))
            .map((kv) => ({
                to: toUUID,
                pos: Point.fromString(kv[1]),
                id: Teleporters.getId(kv[0]),
            }))[0]
    }

    getTeleporterLocations(): Point[] {
        return Object.entries(this.teleporters).map((kv) => Point.fromString(kv[1]))
    }

    private getTeleporterLinkedPos(to: string, id: string): Point {
        const dest = LocationManager.instance.get(to)
        const teleporterId = Teleporters.teleporterId(this.uuid, id)
        // TODO clean this up
        const link = (dest as BasicLocation).teleporters[teleporterId]
        if (!link) {
            throw new Error(`teleporter ${teleporterId} not found`)
        }
        return Point.fromString(link)
    }

    private readonly projectiles = new Set<Entity>()

    addProjectile(e: Entity): void {
        this.projectiles.add(e)
    }
    removeProjectile(e: Entity): void {
        this.projectiles.delete(e)
    }

    getLevel(pt: Point): number {
        return this.levels?.get(pt) ?? 0
    }

    npcUseTeleporter(dude: Dude, teleporter: Teleporter) {
        const linkedLocation = LocationManager.instance.get(teleporter.to)
        const linkedPosition = this.getTeleporterLinkedPos(teleporter.to, teleporter.id)

        this.removeDude(dude)
        linkedLocation.addDude(dude)
        dude.location = linkedLocation

        dude.moveTo(linkedPosition, true)
    }

    playerUseTeleporter(to: string, id: string) {
        // teleporter will get executed on the host
        if (session.isGuest()) {
            return
        }

        const linkedLocation = LocationManager.instance.get(to)
        const linkedPosition = this.getTeleporterLinkedPos(to, id)

        LocationManager.instance.playerLoadLocation(linkedLocation, linkedPosition)

        setTimeout(() => {
            // play a sound, if applicable
            if (id.startsWith(TeleporterPrefix.DOOR)) {
                Sounds.play(...TeleporterSound.DOOR)
            } else if (id.startsWith(TeleporterPrefix.TENT)) {
                Sounds.play(...TeleporterSound.TENT)
            }
        }, 500)
    }

    addFeature<F extends FeatureType>(type: F, data: FeatureData<F>) {
        const f: Feature<F> = { type, data } as unknown as Feature<F>
        this.features.push(f)
        const entity = instantiateFeature(type, data, this)
        if (!entity) {
            console.error(`feature ${type} not instantiated! data = ${JSON.stringify(data)}`)
            return
        }
        this.featureEntities.push(entity)
    }

    getFeatureOfType<F extends FeatureType>(type: F): FeatureData<F> {
        return this.features.find((f) => f.type === type)?.data as unknown as FeatureData<F>
    }

    getEntities() {
        return Array.from(this.getDudes().map((d) => d.entity))
            .concat(this.elements.values().map((c) => c.entity))
            .concat(
                this.ground
                    .values()
                    .filter((c) => !c.tickExclude)
                    .map((c) => c.entity)
            )
            .concat(this.featureEntities)
            .concat(Array.from(this.droppedItems).map((i) => i.entity))
            .concat(Array.from(this.projectiles))
    }

    getDude(dudeType: DudeType): Dude {
        return this.getDudes().filter((d) => d.type === dudeType)[0]
    }

    save(context: SaveContext): LocationSaveState {
        return {
            uuid: this.uuid,
            type: this.type,
            ground: this.saveGround(),
            elements: this.saveElements(),
            dudes: this.getDudes()
                .filter((d) => d.isAlive && !!d.entity)
                .filter((d) => {
                    switch (context) {
                        case "multiplayer":
                            // sync all spawned dudes as they exist in the world
                            return true
                        case "save":
                            // we don't want to include online players in the location save data
                            return !d.uuid.startsWith(ONLINE_PLAYER_DUDE_ID_PREFIX)
                    }
                })
                .map((d) => d.save()),
            features: this.features,
            teleporters: this.teleporters,
            isInterior: this.isInterior,
            allowPlacing: this.allowPlacing,
            size: this.size,
            levels: this.levels?.serialize(),
        }
    }

    checkDroppedItemCollision(dude: Dude) {
        this.droppedItems.forEach((item) => {
            item.checkCollision(dude)
        })
    }

    addDroppedItem(item: DroppedItem) {
        this.droppedItems.add(new Entity().addComponent(item))
    }

    removeDroppedItem(item: DroppedItem) {
        item.entity.selfDestruct()
        this.droppedItems.delete(item)
    }

    removeAllDroppedItems() {
        this.droppedItems.forEach((i) => i.entity.selfDestruct())
        this.droppedItems.clear()
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

        const n = new BasicLocation({
            type: saveState.type,
            isInterior: saveState.isInterior,
            allowPlacing: saveState.allowPlacing,
            size,
            levels,
            uuid: saveState.uuid,
        })

        saveState.features.forEach((f) => n.addFeature(f.type, f.data))
        n.teleporters = saveState.teleporters
        saveState.ground.forEach((el) =>
            n.setGroundElement(el.type, Point.fromString(el.pos), el.obj)
        )
        saveState.elements.forEach((el) => n.loadElement(el.type, el.pos, el.obj))
        saveState.dudes.forEach((d) => DudeFactory.instance.load(d, n as Location))
        n.toggleAudio(false)

        return n
    }
}
