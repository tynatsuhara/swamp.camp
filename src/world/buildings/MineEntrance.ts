import { Entity, Point } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { GroundRenderer } from "../GroundRenderer"
import { Location } from "../Location"
import { camp, LocationManager, LocationType } from "../LocationManager"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

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
            new NavMeshCollider(
                wl,
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
                () => wl.playerUseTeleporter(destinationUUID, doorId),
                new Point(0, -17)
            )
        )

        return e.addComponent(
            new ElementComponent(ElementType.MINE_ENTRANCE, pos, () => ({
                destinationUUID,
            }))
        )
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return wl.getGround(pos)?.type === GroundType.PATH
    }
}

const makeMineInterior = (outside: Location) => {
    const l = new Location(LocationType.MINE_INTERIOR, true, false)
    LocationManager.instance.add(l)

    const dimensions = new Point(5, 3)
    l.setBarriers(InteriorUtils.makeBarriers(dimensions))

    // background sprite
    l.sprites.addSprite("mine-small", new Point(0, -2 * TILE_SIZE), 0, GroundRenderer.DEPTH)

    const interactablePos = new Point(dimensions.x / 2, 0).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(12),
        id: TeleporterPrefix.MINE,
    }
    l.addTeleporter(teleporter)

    l.addElement(ElementType.MINE_EXIT, new Point(2, 0), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.MINE,
    })

    // Indicate the open floor points so NPCs can roam
    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((pt) =>
        l.setGroundElement(GroundType.BASIC, pt)
    )

    return l
}
