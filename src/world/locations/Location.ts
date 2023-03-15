import { Entity, Point } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { PointAudio } from "../../audio/PointAudio"
import { Dude } from "../../characters/Dude"
import { DudeType } from "../../characters/DudeType"
import { DroppedItem } from "../../items/DroppedItem"
import { SaveContext } from "../../SaveManager"
import { LocationSaveState } from "../../saves/LocationSaveState"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementDataFormat, ElementType } from "../elements/Elements"
import { FeatureData, FeatureType } from "../features/Features"
import { GroundType } from "../ground/Ground"
import { GroundComponent } from "../ground/GroundComponent"
import { Teleporter } from "../Teleporter"
import { LocationType } from "./LocationType"

export abstract class Location {
    readonly uuid: string
    readonly type: LocationType

    // TODO allow non-square Locations
    readonly size: number // tile dimensions (square)
    get range() {
        return this.size / 2
    }

    readonly isInterior: boolean
    readonly allowPlacing: boolean

    /**
     * @returns A syncFn which will properly redirects data to elements based on grid position.
     */
    abstract elementSyncFn<T extends any[]>(
        namespace: string,
        { x, y }: Point,
        fn: (...args: T) => void
    ): (...args: T) => void

    abstract getDudes(): Dude[]

    abstract addDude(dude: Dude): void

    abstract removeDude(dude: Dude): void

    abstract setGroundElement(type: GroundType, tilePoint: Point, data?: object): GroundComponent

    abstract reloadElement(tile: Point): void

    /**
     * Should only be called on hosts!
     */
    abstract addElement<T extends ElementType>(
        type: T,
        tilePoint: PointValue,
        data?: Partial<ElementDataFormat[T]>
    ): ElementComponent<T, ElementDataFormat[T]>

    /**
     * @returns the first element found of the given type, or undefined if none exist
     */
    abstract getElementOfType<T extends ElementType>(
        type: T
    ): ElementComponent<T, ElementDataFormat[T]> | undefined

    abstract getElementsOfType<T extends ElementType>(
        type: T
    ): ElementComponent<T, ElementDataFormat[T]>[]

    abstract getElements(): ElementComponent<any>[]

    /**
     * @returns the element component at the position. NOTE this can return an
     *          element even if this is an "empty" square
     */
    abstract getElement(tilePoint: Point)

    /**
     * @returns the ground component at the position
     */
    abstract getGround(tilePoint: Point)

    /**
     * @returns true if this position in the grid has a solid item
     *          (aka it cannot be walked through)
     */
    abstract isOccupied(tilePoint: Point): boolean

    abstract setOccupied(tilePoint: Point, occupied: boolean): void

    abstract getOccupiedSpots(): Point[]

    /**
     * synced host->client
     */
    abstract removeElementAt: (x: number, y: number) => void

    abstract removeElementLocally(el: ElementComponent<any>): void

    /**
     * @returns All the registered ground spots in the location.
     */
    abstract getAllGroundSpots(): Point[]

    /**
     * @returns All the reasonable ground spots in the location (eg, for possible roaming options).
     *          For exterior locations, excludes the very edge of the map.
     */
    abstract getWalkableGroundSpots(): Point[]

    abstract findPath(
        tileStart: Point,
        tileEnd: Point,
        heuristic: (pt: Point, goal: Point) => number,
        extraIsOccupiedFilter: (pt: Point) => boolean,
        distance: (a: Point, b: Point) => number
    ): Point[]

    abstract addTeleporter(t: Teleporter): void

    abstract getTeleporter(toUUID: string): Teleporter

    abstract getTeleporterLocations(): Point[]

    abstract npcUseTeleporter(dude: Dude, teleporter: Teleporter): void

    abstract playerUseTeleporter(to: string, id: string): void

    abstract addFeature<F extends FeatureType>(type: F, data: FeatureData<F>)

    abstract getFeatureOfType<F extends FeatureType>(type: F): FeatureData<F>

    abstract getEntities(): Entity[]

    abstract getDude(dudeType: DudeType): Dude

    abstract save(context: SaveContext): LocationSaveState

    abstract checkDroppedItemCollision(dude: Dude): void

    abstract addDroppedItem(item: DroppedItem): void

    abstract removeDroppedItem(item: DroppedItem): void

    abstract removeAllDroppedItems(): void

    abstract getLevel(pt: Point): number

    abstract addProjectile(e: Entity): void

    abstract removeProjectile(e: Entity): void

    ejectResidents(toExteriorUUID: string): void {
        const teleporterToExterior = this.getTeleporter(toExteriorUUID)
        this.getDudes().forEach((d) => {
            this.npcUseTeleporter(d, teleporterToExterior)
        })
    }

    toggleAudio(active: boolean): void {
        this.getEntities()
            .flatMap((e) => e.getComponents(PointAudio))
            .forEach((aud) => aud.setActive(active))
    }
}
