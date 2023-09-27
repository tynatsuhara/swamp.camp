import { Entity, Point, PointValue } from "brigsby/dist"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { interactableDoorIconSupplier } from "./buildings/BuildingUtils"
import { ElementComponent } from "./elements/ElementComponent"
import { ElementFactory } from "./elements/ElementFactory"
import { ElementType } from "./elements/ElementType"
import { Interactable } from "./elements/Interactable"
import { Location } from "./locations/Location"
import { LocationManager } from "./locations/LocationManager"

type TeleporterIndicatorSaveData = {
    teleporterId: string
    i: string // stringified position for the interactable
    offset?: PointValue
}

/**
 * Not to be confused with the WorldLocation first-class citizen Teleporter.
 * This is a component which can be used to teleport to a logical Teleporer destination.
 * It has an arrow sprite and an Interactable which the player can use to teleport.
 * This is used for interior doors back to the exterior.
 */
export class TeleporterIndicatorFactory extends ElementFactory<
    ElementType.TELEPORTER_INDICATOR,
    TeleporterIndicatorSaveData
> {
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.TELEPORTER_INDICATOR)
    }

    make(
        wl: Location,
        pos: Point,
        data: TeleporterIndicatorSaveData
    ): ElementComponent<ElementType.TELEPORTER_INDICATOR, TeleporterIndicatorSaveData> {
        const e = new Entity()

        e.addComponent(
            new Interactable(
                Point.fromString(data.i),
                () => LocationManager.instance.playerUseTeleporter(data.teleporterId),
                new Point(0, TILE_SIZE / 2),
                undefined,
                interactableDoorIconSupplier(data.teleporterId, {
                    icon: "small_arrow_down",
                    color: Color.WHITE,
                })
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.TELEPORTER_INDICATOR, pos, () => data)
        )
    }
}
