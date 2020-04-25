import { Component } from "../../engine/component"
import { AnimatedTileComponent } from "../../engine/tiles/AnimatedTileComponent"
import { Point } from "../../engine/point"
import { Tilesets } from "../graphics/Tilesets"
import { Collider } from "../../engine/collision/Collider"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { LocationManager } from "../world/LocationManager"
import { DroppedItem } from "./DroppedItem"

// TODO: Some kind of "item" base class for dropped items
export class Coin extends DroppedItem {

    /**
     * @param position The bottom center where the item should be placed
     */
    constructor(position: Point) {
        super(position, Tilesets.instance.dungeonCharacters.getTileSetAnimation("coin_anim", 150))
    }

    // private collide(c: Collider) {
    //     const player = c.entity.getComponent(Player)
    //     if (!!player) {
    //         const d = player.entity.getComponent(Dude)
    //         if (d.isAlive) {
    //             player.entity.getComponent(Dude).inventory.coins++
    //             LocationManager.instance.currentLocation.dynamic.delete(this.entity)
    //             this.entity.selfDestruct()
    //         }
    //     }
    // }
}