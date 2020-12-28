import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Item } from "../../items/Items"
import { HittableResource } from "./HittableResource"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { WeaponType } from "../../characters/weapons/WeaponType"
import { Player } from "../../characters/Player"
import { ElementFactory } from "./ElementFactory"

export const enum TreeType {
    ROUND = 1,
    POINTY = 2,
}

export class TreeFactory extends ElementFactory {

    readonly type: ElementType.TREE_ROUND|ElementType.TREE_POINTY
    readonly dimensions = new Point(1, 2)

    constructor(type: ElementType.TREE_ROUND|ElementType.TREE_POINTY) {
        super()
        this.type = type
    }

    // TODO: Make growable
    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const maxResourcesCount = 4
        const availableResources = data["a"] ?? maxResourcesCount

        const e = new Entity()
        const depth = (pos.y + 2) * TILE_SIZE
        const prefix = this.type === ElementType.TREE_ROUND ? "treeRound" : "treePointy"
        const top = addTile(e, `${prefix}Top`, pos, depth)
        const bottom = addTile(e, `${prefix}Base`, pos.plus(new Point(0, 1)), depth)
        const hitboxDims = new Point(8, 3)
        
        e.addComponent(new BoxCollider(
            pos.plus(new Point(.5, 2)).times(TILE_SIZE).minus(new Point(hitboxDims.x/2, hitboxDims.y)), 
            hitboxDims
        ))

        const saplingType = this.type === ElementType.TREE_ROUND ? Item.ROUND_SAPLING : Item.POINTY_SAPLING

        const hittableCenter = pos.times(TILE_SIZE).plus(new Point(TILE_SIZE/2, TILE_SIZE + TILE_SIZE/2))  // center of bottom tile
        const hittableResource = e.addComponent(new HittableResource(
            hittableCenter, [top.transform, bottom.transform], availableResources, maxResourcesCount, 
            () => {
                const getItem = () => Math.random() < .2 ? saplingType : Item.WOOD
                if (Player.instance.dude.weaponType === WeaponType.AXE) {
                    return [getItem(), getItem()]
                } else {
                    return [getItem()]
                }
            }
        ))

        return e.addComponent(new ElementComponent(
            this.type, 
            pos,
            [pos.plusY(1)], 
            () => { return { a: hittableResource.freeResources } }
        ))
    }
}

const addTile = (e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
    return tile
}
