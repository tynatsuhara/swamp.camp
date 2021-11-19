import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { ElementComponent } from "./elements/ElementComponent"
import { ElementType } from "./elements/Elements"
import { Interactable } from "./elements/Interactable"
import { WorldLocation } from "./WorldLocation"
import { ElementFactory } from "./elements/ElementFactory"
import { Sounds } from "../audio/Sounds"
import { assets } from "brigsby/dist/Assets"
import { UIStateManager } from "../ui/UIStateManager"

export type Teleporter = {
    to: string // destination uuid
    pos: Point // point representing where a dude will be STANDING after traveling to this teleporter
    id: string // to distinguish multiple teleporters between the same destinations. prefixes can be used to trigger sound effects
}

export const TeleporterPrefix = {
    TENT: "tent",
    DOOR: "door",
    MINE: "mine",
}

export class TeleporterSound {
    static readonly TENT: [string, number] = ["audio/rpg/world/tent.wav", 0.05]
    static readonly DOOR: [string, number] = ["audio/rpg/world/door.wav", 0.05]
}

assets.loadAudioFiles([TeleporterSound.TENT, TeleporterSound.DOOR].map((ts) => ts[0]))

export const Teleporters = {
    teleporterId: (toUUID: string, id: string = null) => {
        return `${toUUID}${!!id ? `$${id}` : ""}`
    },

    getId: (teleporterId: string) => {
        const dollarIndex = teleporterId.indexOf("$")
        return dollarIndex === -1
            ? undefined
            : teleporterId.substring(teleporterId.indexOf("$") + 1)
    },
}

/**
 * Not to be confused with the WorldLocation first-class citizen Teleporter.
 * This is a component which can be used to teleport to a logical Teleporer destination.
 * It has an arrow sprite and an Interactable which the player can use to teleport.
 */
export class TeleporterFactory extends ElementFactory {
    readonly type = ElementType.TELEPORTER
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: any): ElementComponent {
        const e = new Entity()

        const destinationUUID = data.to
        const i = data.i // the position for the interactable
        if (!destinationUUID || !i) {
            throw new Error("teleporter element must have 'to' and 'i' parameters")
        }
        const interactPos = Point.fromString(i)
        const id = data.id

        const interactComponent = e.addComponent(
            new Interactable(
                interactPos,
                () => wl.useTeleporter(destinationUUID, id),
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

        return e.addComponent(new ElementComponent(ElementType.TELEPORTER, pos, [pos], () => data))
    }
}
