import { Entity, Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { Location } from "../locations/Location"
import { Burnable } from "./Burnable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./ElementType"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"

type LogsData = {
    b?: boolean // burning
    logs: number
}

export class PileOfLogsFactory extends ElementFactory<ElementType.PILE_O_LOGS, LogsData> {
    dimensions = pt(1)

    constructor() {
        super(ElementType.PILE_O_LOGS)
    }

    make(wl: Location, pos: Point, data: Partial<LogsData>) {
        const e = new Entity()
        const pixelPos = pos.times(TILE_SIZE)
        const depth = pixelPos.y + 5
        let logs = data.logs ?? 1

        e.addComponent(
            Tilesets.instance.outdoorTiles
                .getTileAt(pt(53, 22))
                .toComponent(SpriteTransform.new({ position: pixelPos, depth }))
        )

        e.addComponent(new NavMeshCollider(wl, pixelPos.plus(pt(2, 5)), pt(13, 11)))

        const burnable = e.addComponent(new Burnable(!!data.b, [pos]))

        const interactable = e.addComponent(
            new Interactable(
                pixelPos.plus(pt(TILE_SIZE / 2)),
                (dude) => {
                    if (session.isHost()) {
                        const amountAdded = dude.inventory.addMax(Item.WOOD, logs)
                        logs -= amountAdded
                        if (logs === 0) {
                            e.selfDestruct()
                        }
                    }
                },
                pt(1, -15)
            )
        )

        return e.addComponent(
            new ElementComponent(this.type, pos, () => ({
                b: burnable.isBurning,
                logs,
            }))
        )
    }
}
