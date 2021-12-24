import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { Location } from "../Location"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"

export class BenchFactory extends ElementFactory {
    readonly type = ElementType.BENCH
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: object): ElementComponent {
        const e = new Entity()

        const pixelPos = pos.times(TILE_SIZE)
        const pixelCenterPos = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)

        const sprite = e.addComponent(
            Tilesets.instance.outdoorTiles.getTileSource("bench").toComponent(
                SpriteTransform.new({
                    position: pixelPos,
                    depth: pixelPos.y + TILE_SIZE,
                })
            )
        )

        e.addComponent(new BoxCollider(pixelPos.plusX(2).plusY(12), new Point(12, 3)))

        if (wl.allowPlacing) {
            e.addComponent(
                new Breakable(pixelCenterPos, [sprite.transform], () =>
                    Lists.repeat(3, [Item.WOOD])
                )
            )
        }

        return e.addComponent(new ElementComponent(this.type, pos, [pos], () => data))
    }
}
