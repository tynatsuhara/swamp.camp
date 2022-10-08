import { Entity, Point } from "brigsby/dist"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/Elements"
import { Interactable } from "../elements/Interactable"
import { Location } from "../locations/Location"

export class MineExitFactory extends ElementFactory {
    readonly type = ElementType.MINE_EXIT
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()

        const destinationUUID = data.to
        const i = data.i // the position for the interactable
        if (!destinationUUID || !i) {
            throw new Error("teleporter element must have 'to' and 'i' parameters")
        }
        const interactPos = Point.fromString(i)
        const id = data.id

        e.addComponent(
            new Interactable(
                interactPos,
                () => wl.playerUseTeleporter(destinationUUID, id),
                new Point(0, -TILE_SIZE)
            )
        )

        return e.addComponent(new ElementComponent(ElementType.MINE_EXIT, pos, () => data))
    }
}
