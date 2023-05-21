import { Entity, Point } from "brigsby/dist"
import { ItemStack } from "../../items/Inventory"
import { Item } from "../../items/Item"
import { ItemMetadata } from "../../items/Items"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/ElementType"
import { ElementUtils } from "../elements/ElementUtils"
import { Ground } from "../ground/Ground"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { ConstructionSite, ConstructionState } from "./ConstructionSite"

export type ConstructionRequirements = {
    hours: number
    materials: ItemStack[]
}

/**
 * At runtime, a building exterior is built with several components:
 *   1. Tiles, the visual component
 *   2. A collider
 *   3. A door teleporter
 * Data that is saved:
 *   1. Element type
 *   2. "Occupied points" which determines occupied squares in the world grid
 *   3. Misc metadata about the building
 */
export abstract class BuildingFactory<
    Type extends ElementType,
    SaveFormat extends object = object
> extends ElementFactory<Type, SaveFormat> {
    canPlaceAtPos(wl: Location, pos: Point) {
        return ElementUtils.rectPoints(pos, this.dimensions)
            .map((pt) => wl.getGround(pt)?.type)
            .every((type) => Ground.isNaturalGround(type))
    }

    canPlaceInLocation(l: Location) {
        return l === camp()
    }

    /**
     * Internal wrapped implementation for
     */
    abstract makeBuilding(
        wl: Location,
        pos: Point,
        data: Partial<SaveFormat>
    ): ElementComponent<Type, SaveFormat>

    /**
     * readonly to make overriding by subclasses slightly more difficult
     */
    readonly make = (
        wl: Location,
        pos: Point,
        data: Partial<SaveFormat>
    ): ElementComponent<Type, SaveFormat> => {
        // TODO: Add construction process

        let constructionState = data["constructionState"] as ConstructionState

        const letDudesClaim = () => {
            // let dudes claim this new home, if possible
            wl.getDudes().forEach((d) => d.tryToClaimResidence())
        }

        const completeConstruction = () => {
            // todo push dudes away like in PlaceElementFrame
            constructionState = undefined
            wl.reloadElement(pos)
            letDudesClaim()
        }

        if (constructionState) {
            const e = new Entity()
            e.addComponent(
                new ConstructionSite(
                    wl,
                    pos,
                    this.dimensions,
                    constructionState,
                    this.getConstructionRequirements().materials,
                    completeConstruction
                )
            )
            // @ts-ignore ugh
            return e.addComponent(
                new ElementComponent(this.type, pos, () => ({
                    ...data,
                    constructionState,
                }))
            )
        } else {
            letDudesClaim()
        }

        return this.makeBuilding(wl, pos, data)
    }

    /**
     * @returns ConstructionRequirements if this building has a construction process.
     *          Subclasses should override this method to adjust their construction parameters!
     */
    getConstructionRequirements(): ConstructionRequirements {
        return {
            hours: 5 * 24,
            materials: [new ItemStack(Item.WOOD, 20), new ItemStack(Item.ROCK, 10)],
        }
    }

    itemMetadataToSaveFormat(metadata: ItemMetadata) {
        const reqs = this.getConstructionRequirements()
        if (!reqs) {
            return undefined
        }

        const initialConstructionState: ConstructionState = {
            hasSupplies: false,
            hoursLeft: reqs.hours,
        }
        return { constructionState: initialConstructionState } as unknown as Partial<SaveFormat>
    }
}
