import { Entity, Point, pt } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Sounds } from "../../audio/Sounds"
import { ImageFilters } from "../../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, ItemMetadata } from "../../items/Items"
import { Color } from "../../ui/Color"
import { Breakable } from "../elements/Breakable"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { Location } from "../locations/Location"
import { LocationManager, LocationType } from "../locations/LocationManager"
import { Teleporter, TeleporterPrefix, TeleporterSound } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type Variant = { dark: Color; light: Color; accent: Color }

const VARIANTS = {
    red: { dark: Color.PINK_2, light: Color.PINK_3, accent: Color.PINK_4 },
    blue: { dark: Color.BLUE_3, light: Color.BLUE_4, accent: Color.BLUE_5 },
}

export type TentColor = keyof typeof VARIANTS
type TentData = { color: TentColor; destinationUUID: string }

export class TentFactory extends BuildingFactory<TentData> {
    readonly type = ElementType.TENT
    readonly dimensions = new Point(4, 3)

    make(
        wl: Location,
        pos: Point,
        { color = "blue", destinationUUID = makeTentInterior(wl, color).uuid }
    ) {
        const e = new Entity()

        const colorVariant = VARIANTS[color]
        const tentCenterPos = pos.plus(new Point(2, 1)).times(TILE_SIZE)
        const interactablePos = tentCenterPos.plusY(TILE_SIZE)
        const doorId = TeleporterPrefix.TENT
        const sourceTeleporter = {
            to: destinationUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        }
        wl.addTeleporter(sourceTeleporter)

        // Set up tiles
        const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 1
        const tiles = [
            addTile(e, `tentNW`, pos.plusX(1), depth, colorVariant),
            addTile(e, `tentNE`, pos.plus(new Point(2, 0)), depth, colorVariant),
            addTile(e, `tentSW`, pos.plus(new Point(1, 1)), depth, colorVariant),
            addTile(e, `tentSE`, pos.plus(new Point(2, 1)), depth, colorVariant),
        ]
        e.addComponent(
            new NavMeshCollider(
                wl,
                pos.plus(new Point(1, 1)).times(TILE_SIZE),
                new Point(TILE_SIZE * 2, TILE_SIZE)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.playerUseTeleporter(destinationUUID, doorId),
                new Point(1, -TILE_SIZE * 1.4)
            )
        )

        // TODO: Disable for now?
        e.addComponent(
            new Breakable(
                interactablePos,
                tiles.map((t) => t.transform),
                () => [{ item: Item.TENT, metadata: { color } }],
                () => Sounds.play(...TeleporterSound.TENT),
                10
            )
        )

        return e.addComponent(
            new ElementComponent<TentData>(ElementType.TENT, pos, () => {
                return { destinationUUID, color }
            })
        )
    }

    itemMetadataToSaveFormat(metadata: ItemMetadata): TentData {
        return {
            color: metadata.color,
            destinationUUID: undefined,
        }
    }
}

const getVariantFilter = (color: Variant) => {
    return ImageFilters.recolor(
        [Color.PINK_2, color.dark],
        [Color.PINK_3, color.light],
        [Color.PINK_4, color.accent]
    )
}

const addTile = (e: Entity, s: string, pos: Point, depth: number, color: Variant) => {
    return e.addComponent(
        new SpriteComponent(
            Tilesets.instance.outdoorTiles.getTileSource(s).filtered(getVariantFilter(color)),
            SpriteTransform.new({ position: pos.times(TILE_SIZE), depth })
        )
    )
}

const makeTentInterior = (outside: Location, color: TentColor): Location => {
    // TODO change the isPlayerTent logic to support more than 2 tents
    const isPlayerTent = color === "blue"
    const l = new Location(LocationType.TENT_INTERIOR, true, isPlayerTent)
    LocationManager.instance.add(l)

    const floorDimensions = new Point(5, 4)
    ElementUtils.rectPoints(Point.ZERO, floorDimensions).forEach((p) =>
        l.setGroundElement(GroundType.BASIC, p)
    )

    InteriorUtils.addBarriers(l, floorDimensions)

    const interactablePos = new Point(floorDimensions.x / 2, floorDimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.TENT,
    }
    l.addTeleporter(teleporter)
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(2, 4), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.TENT,
    })

    l.addFeature("tentInteriorSprite", { color })

    if (!isPlayerTent) {
        l.addElement(ElementType.BEDROLL, new Point(3, 0))
    }

    return l
}

export const tentInteriorSprite = ({ color }: { color: TentColor }) => {
    const render = Tilesets.instance.largeSprites
        .getTileSource("tent-interior")
        .filtered(getVariantFilter(VARIANTS[color]))
        .toImageRender(
            SpriteTransform.new({
                position: pt(0, -TILE_SIZE * 3),
                depth: Number.MIN_SAFE_INTEGER,
            })
        )
    return new Entity([new BasicRenderComponent(render)])
}
