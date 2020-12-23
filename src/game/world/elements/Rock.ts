import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Item } from "../../items/Items"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { HittableResource } from "./HittableResource"
import { Player } from "../../characters/Player"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { ElementFactory } from "./ElementFactory"

export class RockFactory extends ElementFactory {

    readonly type = ElementType.ROCK
    readonly dimensions = new Point(1, 1)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const e = new Entity()
        const variation = data["v"] ?? (Math.floor(Math.random() * 3) + 1)
        const mossy = data["m"] ?? (Math.random() > .7)
        const flipped = data["f"] ?? (Math.random() > .5)
        const maxResourcesCount = 6
        const availableResources = data["a"] ?? maxResourcesCount

        const tile = e.addComponent(new TileComponent(
            Tilesets.instance.outdoorTiles.getTileSource(`rock${variation}${mossy ? 'mossy' : ''}`), 
            new TileTransform(pos.times(TILE_SIZE))
        ))
        tile.transform.depth = (pos.y + 1) * TILE_SIZE - /* prevent weapon from clipping */ 5
        tile.transform.mirrorX = flipped

        const hitboxDims = new Point(12, 4)
        e.addComponent(new BoxCollider(
            pos.plus(new Point(.5, 1)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y + 2)), 
            hitboxDims
        ))

        const hittableResource = e.addComponent(new HittableResource(
            pos.plus(new Point(.5, .5)).times(TILE_SIZE), [tile.transform], availableResources, maxResourcesCount, 
            () => {
                if (Player.instance.dude.weaponType === WeaponType.PICKAXE) {
                    return Math.random() > .5 ? [Item.IRON] : [Item.ROCK]
                } else {
                    return Math.random() > .9 ? [Item.IRON] : [Item.ROCK]
                }
            }
        ))

        return e.addComponent(new ElementComponent(
            ElementType.ROCK, 
            pos,
            [pos], 
            () => { return { v: variation, m: mossy, f: flipped, a: hittableResource.freeResources } }
        ))
    }
}
