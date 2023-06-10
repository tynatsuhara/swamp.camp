import { Entity, Point } from "brigsby/dist"
import { PointValue } from "brigsby/dist/Point"
import { PointAudio } from "../../audio/PointAudio"
import { Dude } from "../../characters/Dude"
import { DudeType } from "../../characters/DudeType"
import { SaveContext } from "../../core/SaveManager"
import { DroppedItem } from "../../items/DroppedItem"
import { LocationSaveState } from "../../saves/LocationSaveState"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { ElementDataFormat } from "../elements/Elements"
import { FeatureData, FeatureType } from "../features/Features"
import { GroundType } from "../ground/Ground"
import { GroundComponent } from "../ground/GroundComponent"
import { LocationManager } from "./LocationManager"
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

    // ==================== Dudes ==================== //

    abstract addDude(dude: Dude): void

    abstract removeDude(dude: Dude): void

    abstract getDudes(): Dude[]

    abstract getDude(dudeType: DudeType): Dude

    // ==================== Ground ==================== //

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
    abstract getElement<T extends ElementType>(tilePoint: Point): ElementComponent<T>

    /**
     * @returns A syncFn which will properly redirects data to elements based on grid position.
     */
    abstract elementSyncFn<T extends any[]>(
        namespace: string,
        { x, y }: Point,
        fn: (...args: T) => void
    ): (...args: T) => void

    /**
     * synced host->client
     */
    abstract removeElementAt: (x: number, y: number) => void

    abstract removeElementLocally(el: ElementComponent<any>): void

    // ==================== Ground ==================== //

    /**
     * @returns the ground component at the position
     */
    abstract getGround(tilePoint: Point): GroundComponent

    /**
     * @returns true if this position in the grid has a solid item
     *          (aka it cannot be walked through)
     */
    abstract isOccupied(tilePoint: Point): boolean

    abstract setOccupied(tilePoint: Point, occupied: boolean): void

    abstract getOccupiedSpots(): Point[]

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

    // ==================== Features ==================== //

    abstract addFeature<F extends FeatureType>(type: F, data: FeatureData<F>): void

    abstract getFeatureOfType<F extends FeatureType>(type: F): FeatureData<F>

    abstract getFeaturesOfType<F extends FeatureType>(type: F): Array<FeatureData<F>>

    // ==================== Moving things ==================== //

    abstract addProjectile(e: Entity): void

    abstract removeProjectile(e: Entity): void

    abstract addDroppedItem(item: DroppedItem): void

    abstract removeDroppedItem(item: DroppedItem): void

    // ==================== Misc ==================== //

    abstract getLevel(pt: Point): number

    abstract checkDroppedItemCollision(dude: Dude): void

    abstract removeAllDroppedItems(): void

    abstract save(context: SaveContext): LocationSaveState

    abstract getEntities(): Entity[]

    // ==================== Non-abstract utils ==================== //

    ejectResidents(teleporterId: string): void {
        this.getDudes().forEach((d) => {
            LocationManager.instance.npcUseTeleporter(d, teleporterId)
        })
    }

    toggleAudio(active: boolean): void {
        this.getEntities()
            .flatMap((e) => e.getComponents(PointAudio))
            .forEach((aud) => aud.setActive(active))
    }
}
