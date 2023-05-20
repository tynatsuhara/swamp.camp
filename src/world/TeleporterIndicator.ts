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

type TeleporterIndicatorSaveData = {
    to: string // the destination uuid (must be different than the current location)
    i: string // stringified position for the interactable
    id: string
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

        const destinationUUID = data.to
        const i = data.i
        if (!destinationUUID || !i) {
            throw new Error("teleporter element must have 'to' and 'i' parameters")
        }
        const interactPos = Point.fromString(i)
        const id = data.id

        const interactComponent = e.addComponent(
            new Interactable(
                interactPos,
                () => wl.playerUseTeleporter(destinationUUID, id),
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
