import { Component } from "../../../engine/component"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { AnimatedTileComponent } from "../../../engine/tiles/AnimatedTileComponent"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Point } from "../../../engine/point"
import { Interactable } from "./Interactable"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { ElementComponent } from "./ElementComponent"
import { WorldLocation } from "../WorldLocation"
import { Entity } from "../../../engine/Entity"
import { ElementType } from "./Elements"
import { PointLightMaskRenderer } from "../PointLightMaskRenderer"

export const makeCampfire = (wl: WorldLocation, pos: Point, data: object): ElementComponent => {
    const e = new Entity()
    const scaledPos = pos.times(TILE_SIZE)
    let on = data["on"] ?? false
    
    const campfireOff = e.addComponent(new TileComponent(
        Tilesets.instance.outdoorTiles.getTileSource("campfireOff"), 
        new TileTransform(scaledPos)
    ))
    campfireOff.enabled = !on
    campfireOff.transform.depth = scaledPos.y + TILE_SIZE

    const campfireOn = e.addComponent(new AnimatedTileComponent(
        [Tilesets.instance.outdoorTiles.getTileSetAnimation("campfireOn", 2, 200)],
        new TileTransform(scaledPos)
    ))
    campfireOn.enabled = on
    campfireOn.transform.depth = scaledPos.y + TILE_SIZE

    const offset = new Point(0, 5)
    e.addComponent(new BoxCollider(
        scaledPos.plus(offset), 
        new Point(TILE_SIZE, TILE_SIZE).minus(offset)
    ))

    const set = (nowOn: boolean) => {
        on = nowOn
        campfireOff.enabled = !nowOn
        campfireOn.enabled = nowOn
        if (nowOn) {
            PointLightMaskRenderer.instance.addLight(pos)
        } else {
            PointLightMaskRenderer.instance.removeLight(pos)
        }
    }

    set(on)

    // Toggle between on/off when interacted with
    e.addComponent(new Interactable(scaledPos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2)), () => set(!on)))

    return e.addComponent(new ElementComponent(
        ElementType.CAMPFIRE, 
        [pos], 
        () => { return { on } }
    ))
}
