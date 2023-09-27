import { Entity, Point, pt } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { interactableDoorIconSupplier } from "./BuildingUtils"

export class MineExitFactory extends ElementFactory<ElementType.MINE_EXIT> {
    readonly dimensions = pt(1, 1)

    constructor() {
        super(ElementType.MINE_EXIT)
    }

    make(wl: Location, pos: Point, data: any) {
        const e = new Entity()

        const interactPos = Point.fromString(data.i)

        e.addComponent(
            new Interactable(
                interactPos,
                () => {
                    LocationManager.instance.playerUseTeleporter(wl.uuid) // the teleporter ID should match the mine interior's UUID
                },
                pt(0, -TILE_SIZE),
                undefined,
                interactableDoorIconSupplier(wl.uuid)
            )
        )

        return e.addComponent(new ElementComponent(ElementType.MINE_EXIT, pos, () => data))
    }
}
