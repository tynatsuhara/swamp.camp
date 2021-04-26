import { Component } from "../../engine/component"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { ElementComponent } from "./elements/ElementComponent"
import { ElementType } from "./elements/Elements"
import { Interactable } from "./elements/Interactable"
import { WorldLocation } from "./WorldLocation"
import { ElementFactory } from "./elements/ElementFactory"
import { Sounds } from "../audio/Sounds"
import { assets } from "../../engine/Assets"

export type Teleporter = {
    to: string   // destination uuid
    pos: Point   // point representing where a dude will be STANDING after traveling to this teleporter 
    id: string  // to distinguish multiple teleporters between the same destinations. prefixes can be used to trigger sound effects
}

export const TeleporterPrefix = {
    TENT: "tent",
    DOOR: "door"
}

export class TeleporterSound {
    static readonly TENT: [string, number] = ["audio/rpg/world/tent.wav", .05]
    static readonly DOOR: [string, number] = ["audio/rpg/world/door.wav", .05]
}

assets.loadAudioFiles([TeleporterSound.TENT, TeleporterSound.DOOR].map(ts => ts[0]))

export const Teleporters = {
    teleporterId: (toUUID: string, id: string = null) => {
        return `${toUUID}${!!id ? `$${id}` : ''}`
    },

    getId: (teleporterId: string) => {
        const dollarIndex = teleporterId.indexOf("$")
        return dollarIndex === -1 ? undefined : teleporterId.substring(teleporterId.indexOf("$") + 1)
    }
}

export class TeleporterFactory extends ElementFactory {

    readonly type = ElementType.TELEPORTER
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const e = new Entity()

        const destinationUUID = data["to"]
        const i = data["i"]  // the position for the interactable
        if (!destinationUUID || !i) {
            throw new Error("teleporter element must have 'to' and 'i' parameters")
        }
        const interactPos = Point.fromString(i)
        const id = data["id"]

        const interactComponent = e.addComponent(new Interactable(
            interactPos, 
            () => wl.useTeleporter(destinationUUID, id), 
            new Point(0, TILE_SIZE/2)
        ))

        // TODO have the arrow pointable in different directions
        e.addComponent(new class extends Component {
            getRenderMethods(): RenderMethod[] {
                if (interactComponent.isShowingUI) {
                    return []
                }
                return [Tilesets.instance.oneBit.getTileSource("small_arrow_down").toImageRender(new TileTransform(pos.times(TILE_SIZE)))]
            }
        })

        return e.addComponent(new ElementComponent(
            ElementType.TELEPORTER, 
            pos,
            [pos],
            () => data
        ))
    }
}