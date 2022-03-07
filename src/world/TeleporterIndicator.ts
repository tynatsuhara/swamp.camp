import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { UIStateManager } from "../ui/UIStateManager"
import { ElementComponent } from "./elements/ElementComponent"
import { ElementFactory } from "./elements/ElementFactory"
import { ElementType } from "./elements/Elements"
import { Interactable } from "./elements/Interactable"
import { Location } from "./Location"

type TeleporterIndicatorSaveData = {
    to: string // the destination uuid (TODO: support same-location teleporters)
    i: string // stringified position for the interactable
    id: string
}

/**
 * Not to be confused with the WorldLocation first-class citizen Teleporter.
 * This is a component which can be used to teleport to a logical Teleporer destination.
 * It has an arrow sprite and an Interactable which the player can use to teleport.
 */
export class TeleporterIndicatorFactory extends ElementFactory<TeleporterIndicatorSaveData> {
    readonly type = ElementType.TELEPORTER_INDICATOR
    readonly dimensions = new Point(1, 1)

    make(
        wl: Location,
        pos: Point,
        data: TeleporterIndicatorSaveData
    ): ElementComponent<TeleporterIndicatorSaveData> {
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

        // TODO have the arrow pointable in different directions
        e.addComponent(
            new (class extends Component {
                getRenderMethods(): RenderMethod[] {
                    if (interactComponent.isShowingUI) {
                        return []
                    }
                    return [
                        Tilesets.instance.oneBit.getTileSource("small_arrow_down").toImageRender(
                            SpriteTransform.new({
                                position: pos.times(TILE_SIZE),
                                depth: UIStateManager.UI_SPRITE_DEPTH,
                            })
                        ),
                    ]
                }
            })()
        )

        return e.addComponent(
            new ElementComponent(ElementType.TELEPORTER_INDICATOR, pos, [pos], () => data)
        )
    }
}