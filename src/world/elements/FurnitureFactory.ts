import { Entity, Point, pt } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"
import { player } from "../../characters/player/index"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { Location } from "../locations/Location"
import { Breakable } from "./Breakable"
import { ElementComponent } from "./ElementComponent"
import { ElementFactory } from "./ElementFactory"
import { ElementType } from "./ElementType"
import { Interactable } from "./Interactable"
import { NavMeshCollider } from "./NavMeshCollider"

export class FurnitureFactory<Type extends ElementType> extends ElementFactory<Type> {
    readonly dimensions = new Point(1, 1)

    constructor(
        type: Type,
        private readonly tileKey: string,
        private readonly interactFn?: (interactor: Dude) => void
    ) {
        super(type)
        this.tileKey = tileKey
    }

    make(wl: Location, pos: Point, data: object): ElementComponent<Type> {
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

        if (this.interactFn) {
            e.addComponent(
                new Interactable(
                    pixelCenterPos,
                    this.interactFn,
                    pt(0, -TILE_SIZE),
                    (dude) => dude === player()
                )
            )
        }

        if (wl.allowPlacing) {
            e.addComponent(
                new Breakable(pixelCenterPos, [sprite.transform], () =>
                    Lists.repeat(3, [{ item: Item.WOOD }])
                )
            )
        }

        return e.addComponent(new ElementComponent(this.type, pos, () => data))
    }
}
