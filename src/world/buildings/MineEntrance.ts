import { Entity, Point, pt } from "brigsby/dist"
import { NineSlice, SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { GroundRenderer } from "../ground/GroundRenderer"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { camp, LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type SaveFormat = { destinationUUID: string }

export class MineEntranceFactory extends BuildingFactory<ElementType.MINE_ENTRANCE, SaveFormat> {
    readonly type = ElementType.MINE_ENTRANCE
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.MINE_ENTRANCE)
    }

    makeBuilding(wl: Location, pos: Point, data: Partial<SaveFormat>) {
        const e = new Entity()
        const pixelPt = pos.times(TILE_SIZE)

        // the interior location UUID
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

    getConstructionRequirements(): ConstructionRequirements {
        return undefined
    }

    canPlaceInLocation(wl: Location) {
        return wl === camp()
    }

    canPlaceAtPos(wl: Location, pos: Point) {
        return wl.getGround(pos)?.type === GroundType.PATH
    }
}

const makeMineInterior = (outside: Location) => {
    const l = new BasicLocation({
        type: LocationType.MINE_INTERIOR,
        isInterior: true,
        allowPlacing: false,
    })

    const dimensions = new Point(3, 2)
    InteriorUtils.addBarriers(l, dimensions)

    const ladderIndex = 1

    l.addFeature("mineInteriorBackground", {
        width: dimensions.x,
        height: dimensions.y,
        ladderIndex,
    })

    const interactablePos = new Point(ladderIndex + 0.5, 0).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(12),
        id: TeleporterPrefix.MINE,
    }
    l.addTeleporter(teleporter)

    l.addElement(ElementType.MINE_EXIT, new Point(Math.ceil(dimensions.x / 2), 0), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.MINE,
    })

    // Indicate the open floor points so NPCs can roam
    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((pt) =>
        l.setGroundElement(GroundType.BASIC, pt)
    )

    return LocationManager.instance.add(l)
}

/**
 * @param width the ground tile width
 * @param height the ground tile height
 */
export const mineInteriorBackground = ({
    width,
    height,
    ladderIndex,
}: {
    width: number
    height: number
    ladderIndex: number
}) => {
    const e = new Entity()

    const tile = (p: Point, size = pt(1)) => {
        return Tilesets.instance.largeSprites.get(pt(24, 0).plus(p), size)
    }

    const topLeft = pt(2, 1)
    const topRight = pt(3, 1)
    const bottomLeft = pt(2, 2)
    const bottomRight = pt(3, 2)
    const topSprites = Lists.range(0, 3).map((i) => pt(i + 1, 0))
    const sideSprites = Lists.range(0, 7).map((i) => pt(0, i))
    const center = Lists.range(0, 6).map((i) => pt(1, i + 1))

    const dimensions = new Point(width, height + 1) // accomodate 1 tile wide walls

    const { sprites } = NineSlice.makeNineSliceComponents(
        [
            () => tile(topLeft),
            () => tile(Lists.oneOf(topSprites)),
            () => tile(topRight),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(Lists.oneOf(center)),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(bottomLeft),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(bottomRight),
        ],
        dimensions,
        {
            position: pt(0, -TILE_SIZE + 3), // shift up a bit to accomodate walls
            depth: GroundRenderer.DEPTH,
        }
    )
    NineSlice.nineSliceForEach(dimensions, (pt, i) => {
        if (i === 5) {
            sprites.get(pt).transform.rotation = 180
        } else if (i === 7) {
            sprites.get(pt).transform.rotation = 270
        }
    })

    // place the ladder
    sprites.remove(pt(ladderIndex, 0))
    e.addComponent(
        tile(pt(2, 3), pt(1, 3)).toComponent(
            SpriteTransform.new({
                position: pt(ladderIndex, -2).times(TILE_SIZE),
                depth: GroundRenderer.DEPTH + 1,
            })
        )
    )

    e.addComponents(sprites.values())

    return e
}
