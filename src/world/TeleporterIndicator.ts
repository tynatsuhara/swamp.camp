import { Component, Entity, Point, PointValue } from "brigsby/dist"
import { RenderMethod } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { UI_SPRITE_DEPTH } from "../ui/UiConstants"
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

        const interactPos = Point.fromString(data.i)

        const interactComponent = e.addComponent(
            new Interactable(
                interactPos,
                () => LocationManager.instance.playerUseTeleporter(data.teleporterId),
                new Point(0, TILE_SIZE / 2)
            )
        )

        e.addComponent(
            new (class extends Component {
                getRenderMethods(): RenderMethod[] {
                    if (interactComponent.isShowingUI) {
                        return []
                    }
                    return [
                        Tilesets.instance.oneBit.getTileSource("small_arrow_down").toImageRender(
                            SpriteTransform.new({
                                position: pos.times(TILE_SIZE).plus(data.offset ?? Point.ZERO),
                                depth: UI_SPRITE_DEPTH,
                            })
                        ),
                    ]
                }
            })()
        )

        return e.addComponent(
            new ElementComponent(ElementType.TELEPORTER_INDICATOR, pos, () => data)
        )
    }
}
