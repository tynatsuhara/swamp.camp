import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { LightManager } from "../LightManager"
import { Location } from "../Location"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

export class MineExitFactory extends ElementFactory {
    readonly type = ElementType.MINE_EXIT
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()
        const centerPos = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)

        LightManager.instance.addLight(wl, this, centerPos.plusY(-2), 20)

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
                () => wl.useTeleporter(destinationUUID, id),
                new Point(0, -TILE_SIZE)
            )
        )

        return e.addComponent(new ElementComponent(ElementType.MINE_EXIT, pos, [pos], () => ({})))
    }
}
