import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteComponent } from "brigsby/dist/sprites/SpriteComponent"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundType } from "../ground/Ground"
import { makeMineInterior } from "../interior/Mine"
import { Location } from "../Location"
import { camp } from "../LocationManager"
import { TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { Interactable } from "./Interactable"

export class MineEntranceFactory extends BuildingFactory {
    readonly type = ElementType.MINE_ENTRANCE
    readonly dimensions = new Point(1, 1)

    make(wl: Location, pos: Point, data: any): ElementComponent {
        const e = new Entity()
        const pixelPt = pos.times(TILE_SIZE)

        // the interior location UUID
        // TODO add mine interior
        const destinationUUID: string = data.destinationUUID ?? makeMineInterior(wl).uuid

        // Render hole
        e.addComponent(
            new SpriteComponent(
                Tilesets.instance.tilemap.getTileAt(new Point(0, 8)),
                SpriteTransform.new({
                    position: pixelPt,
                    depth: pixelPt.y + 3,
                })
            )
        )

        // Set up collider
        const colliderSize = new Point(14, 12)
        e.addComponent(
            new BoxCollider(
                pixelPt.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2)).minus(colliderSize.div(2)),
                colliderSize
            )
        )

        // Set up teleporter
        const interactablePos = pixelPt.plus(new Point(TILE_SIZE / 2, TILE_SIZE / 2))
        const doorId = TeleporterPrefix.MINE
        wl.addTeleporter({
            to: destinationUUID,
            pos: interactablePos.plusY(16),
            id: doorId,
        })
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.useTeleporter(destinationUUID, doorId),
                new Point(0, -17)
            )
        )

        return e.addComponent(
            new ElementComponent(
                ElementType.MINE_ENTRANCE,
                pos,
                this.getOccupiedPoints(pos),
                () => ({
                    destinationUUID,
                })
            )
        )
    }

    getOccupiedPoints(pos: Point) {
        return [pos]
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return wl.getGround(pos)?.type === GroundType.PATH
    }
}
