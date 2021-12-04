import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { makeTentInterior } from "../interior/Tent"
import { Location } from "../Location"
import { TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"
import { Interactable } from "./Interactable"

export const enum TentColor {
    RED = "red",
    BLUE = "blue",
}

export class TentFactory extends BuildingFactory {
    readonly type = ElementType.TENT
    readonly dimensions = new Point(4, 3)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()

        const color: TentColor = data.color ?? TentColor.BLUE
        const destinationUUID: string = data.destinationUUID ?? makeTentInterior(wl, color).uuid

        const interactablePos = pos.plus(new Point(2, 2)).times(TILE_SIZE)
        const doorId = TeleporterPrefix.TENT
        const sourceTeleporter = {
            to: destinationUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        }
        wl.addTeleporter(sourceTeleporter)

        // Set up tiles
        const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 1
        addTile(e, `${color}tentNW`, pos.plusX(1), depth)
        addTile(e, `${color}tentNE`, pos.plus(new Point(2, 0)), depth)
        addTile(e, `${color}tentSW`, pos.plus(new Point(1, 1)), depth)
        addTile(e, `${color}tentSE`, pos.plus(new Point(2, 1)), depth)
        e.addComponent(
            new BoxCollider(
                pos.plus(new Point(1, 1)).times(TILE_SIZE),
                new Point(TILE_SIZE * 2, TILE_SIZE)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.useTeleporter(destinationUUID, doorId),
                new Point(1, -TILE_SIZE * 1.4)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.TENT, pos, this.getOccupiedPoints(pos), () => {
                return { destinationUUID, color }
            })
        )
    }

    getOccupiedPoints(pos: Point) {
        return ElementUtils.rectPoints(pos.plus(new Point(1, 1)), new Point(2, 1))
    }
}

const addTile = (e: Entity, s: string, pos: Point, depth: number) => {
    const tile = e.addComponent(
        new SpriteComponent(
            Tilesets.instance.outdoorTiles.getTileSource(s),
            new SpriteTransform(pos.times(TILE_SIZE))
        )
    )
    tile.transform.depth = depth
}
