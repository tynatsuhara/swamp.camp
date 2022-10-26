import { Entity, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { BED_DIALOGUE } from "../../characters/dialogue/ItemDialogues"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { GroundRenderer } from "../GroundRenderer"
import { Location } from "../locations/Location"
import { camp } from "../locations/LocationManager"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"
import { RestPoint } from "./RestPoint"

type BedType = ElementType.BEDROLL | ElementType.BED

export class BedFactory extends ElementFactory<BedType> {
    readonly dimensions = new Point(1, 1)

    constructor(type: BedType) {
        super(type)
    }

    make(wl: Location, pos: Point, data: object) {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1))

        const isBedroll = this.type === ElementType.BEDROLL
        const depth = isBedroll ? GroundRenderer.DEPTH + 1 : scaledPos.y + TILE_SIZE - 10

        const tile = e.addComponent(
            Tilesets.instance.outdoorTiles
                .getTileSource(isBedroll ? "bedroll" : "bed")
                .toComponent(SpriteTransform.new({ position: scaledPos, depth }))
        )

        if (!isBedroll) {
            e.addComponent(new NavMeshCollider(wl, scaledPos, new Point(TILE_SIZE, TILE_SIZE)))
            e.addComponent(
                new Breakable(pixelCenterPos, [tile.transform], () =>
                    Lists.repeat(Math.random() * 4 + 4, [{ item: Item.WOOD }])
                )
            )
        }

        const bed = e.addComponent(new Bed())

        e.addComponent(
            new Interactable(
                pixelCenterPos,
                () => {
                    DialogueDisplay.instance.startDialogue(bed)
                },
                new Point(1, -TILE_SIZE)
            )
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => {
                return {}
            })
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl !== camp()
    }
}

export class Bed extends RestPoint implements DialogueSource {
    dialogue: string = BED_DIALOGUE
}
