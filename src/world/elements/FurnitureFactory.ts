import { Entity, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Items"
import { Location } from "../locations/Location"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./Elements"
import { NavMeshCollider } from "./NavMeshCollider"

export class FurnitureFactory extends ElementFactory {
    readonly type: ElementType
    readonly dimensions = new Point(1, 1)

    private readonly tileKey: string

    constructor(type: ElementType, tileKey: string) {
        super()
        this.type = type
        this.tileKey = tileKey
    }

    make(wl: Location, pos: Point, data: object): ElementComponent {
        const e = new Entity()

        const pixelPos = pos.times(TILE_SIZE)
        const pixelCenterPos = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)

        const sprite = e.addComponent(
            Tilesets.instance.outdoorTiles.getTileSource(this.tileKey).toComponent(
                SpriteTransform.new({
                    position: pixelPos,
                    depth: pixelPos.y + TILE_SIZE,
                })
            )
        )

        e.addComponent(new NavMeshCollider(wl, pixelPos.plusX(2).plusY(12), new Point(12, 3)))

        if (wl.allowPlacing) {
            e.addComponent(
                new Breakable(pixelCenterPos, [sprite.transform], () =>
                    Lists.repeat(3, [Item.WOOD])
                )
            )
        }

        return e.addComponent(new ElementComponent(this.type, pos, () => data))
    }
}
