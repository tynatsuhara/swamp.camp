import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { Interactable } from "./Interactable"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"
import { makeTentInterior } from "../interior/Tent"
import { Player } from "../../characters/Player"
import { Teleporters } from "../Teleporter"
import { ElementFactory } from "./ElementFactory"

export const enum TentColor {
    RED = "red",
    BLUE = "blue"
}

/**
 * At runtime, a building exterior consists of several components:
 *   1. Tiles, the visual component
 *   2. A collider
 *   3. A door teleporter
 * Data that is saved:
 *   1. Element type
 *   2. "Occupied points" which determines occupied squares in the world grid
 *   3. Misc metadata about the building
 */
export class TentFactory extends ElementFactory {
    
    readonly type = ElementType.TENT
    readonly dimensions = new Point(4, 3)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {
        const e = new Entity()

        const color: TentColor = data["color"] ?? TentColor.BLUE
        const destinationUUID: string = data["destinationUUID"] ?? makeTentInterior(wl, color).uuid

        const interactablePos = pos.plus(new Point(2, 2)).times(TILE_SIZE)
        const sourceTeleporter = { to: destinationUUID, pos: interactablePos.plusY(12) }
        wl.addTeleporter(sourceTeleporter)
        
        // Set up tiles
        const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 1
        addTile(e, `${color}tentNW`, pos.plusX(1), depth)
        addTile(e, `${color}tentNE`, pos.plus(new Point(2, 0)), depth)
        addTile(e, `${color}tentSW`, pos.plus(new Point(1, 1)), depth)
        addTile(e, `${color}tentSE`, pos.plus(new Point(2, 1)), depth)
        e.addComponent(new BoxCollider(pos.plus(new Point(1, 1)).times(TILE_SIZE), new Point(TILE_SIZE*2, TILE_SIZE)))

        // Set up teleporter
        e.addComponent(new Interactable(interactablePos, () => wl.useTeleporter(destinationUUID), new Point(1, -TILE_SIZE*1.4)))

        return e.addComponent(new ElementComponent(
            ElementType.TENT, 
            pos,
            ElementUtils.rectPoints(pos.plus(new Point(1, 1)), new Point(2, 1)),
            () => { return { destinationUUID, color } }
        ))
    }
}

const addTile = (e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(new TileComponent(Tilesets.instance.outdoorTiles.getTileSource(s), new TileTransform(pos.times(TILE_SIZE))))
    tile.transform.depth = depth
}
