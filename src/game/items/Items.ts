import { Tilesets } from "../graphics/Tilesets"
import { Entity } from "../../engine/Entity"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"
import { Point } from "../../engine/point"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

export class Item {
    readonly droppedIconSupplier: () => TileSetAnimation
    readonly stackLimit: number

    constructor(
        droppedIconSupplier: () => TileSetAnimation,
        stackLimit: number = 1
    ) {
        this.droppedIconSupplier = droppedIconSupplier
        this.stackLimit = stackLimit
    }
}

export const Items = {
    COIN: new Item(() => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150)),
    WOOD: new Item(() => Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150), 100),
}

export const spawnItem = (pos: Point, item: Item) => {
    LocationManager.instance.currentLocation.dynamic.add(new Entity([new DroppedItem(pos, item)]))
}