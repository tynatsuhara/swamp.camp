import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { DialogueSource } from "../../characters/dialogue/Dialogue"
import { BED_DIALOGUE } from "../../characters/dialogue/ItemDialogues"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"
import { RestPoint } from "./RestPoint"

export class BedFactory extends ElementFactory {
    readonly type = ElementType.BED
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: object): ElementComponent {
        const e = new Entity()
        const scaledPos = pos.times(TILE_SIZE)
        const depth = scaledPos.y + TILE_SIZE - 10
        const pixelCenterPos = scaledPos.plus(new Point(TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1))

        const tile = e.addComponent(
            new SpriteComponent(
                Tilesets.instance.outdoorTiles.getTileSource("bed"),
                SpriteTransform.new({ position: scaledPos, depth })
            )
        )

        e.addComponent(new NavMeshCollider(wl, scaledPos, new Point(TILE_SIZE, TILE_SIZE)))

        const bed = e.addComponent(new Bed())

        e.addComponent(
            new Breakable(pixelCenterPos, [tile.transform], () =>
                Lists.repeat(Math.random() * 4 + 4, [Item.WOOD])
            )
        )

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
            new ElementComponent(ElementType.BED, pos, () => {
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
