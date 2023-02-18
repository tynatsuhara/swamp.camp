import { Entity, Point, pt } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Sounds } from "../../audio/Sounds"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item, ItemMetadata } from "../../items/Items"
import { getTentVariantImageFilter, TentColor, TentData } from "../../items/TentVariants"
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
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

export class TentFactory extends BuildingFactory<ElementType.TENT, TentData> {
    readonly dimensions = new Point(4, 3)

    constructor() {
        super(ElementType.TENT)
    }

    makeBuilding(
        wl: Location,
        pos: Point,
        { color = "taupe", destinationUUID = makeTentInterior(wl, color).uuid }
    ) {
        const e = new Entity()

        const tentCenterPos = pos.plus(new Point(2, 1)).times(TILE_SIZE)
        const interactablePos = tentCenterPos.plusY(TILE_SIZE)
        const doorId = TeleporterPrefix.TENT
        const sourceTeleporter = {
            to: destinationUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        }
        wl.addTeleporter(sourceTeleporter)

        const data: TentData = { color, destinationUUID }

        // Set up tiles
        const depth = (pos.y + 1) * TILE_SIZE + /* prevent clipping */ 1
        const tiles = [
            addTile(e, `tentNW`, pos.plusX(1), depth, color),
            addTile(e, `tentNE`, pos.plus(new Point(2, 0)), depth, color),
            addTile(e, `tentSW`, pos.plus(new Point(1, 1)), depth, color),
            addTile(e, `tentSE`, pos.plus(new Point(2, 1)), depth, color),
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

        e.addComponent(
            new Breakable(
                interactablePos,
                tiles.map((t) => t.transform),
                () => [{ item: Item.TENT, metadata: data }],
                () => Sounds.playAtPoint(...TeleporterSound.TENT, tentCenterPos),
                10
            )
        )

        return e.addComponent(new ElementComponent(ElementType.TENT, pos, () => data))
    }

    getConstructionRequirements(): ConstructionRequirements {
        // tents don't require construction
        return undefined
    }

    itemMetadataToSaveFormat(metadata: ItemMetadata): Partial<TentData> {
        return {
            ...super.itemMetadataToSaveFormat(metadata),
            color: metadata.color,
            destinationUUID: metadata.destinationUUID,
        }
    }
}

const addTile = (e: Entity, s: string, pos: Point, depth: number, color: TentColor) => {
    return e.addComponent(
        new SpriteComponent(
            Tilesets.instance.outdoorTiles
                .getTileSource(s)
                .filtered(getTentVariantImageFilter(color)),
            SpriteTransform.new({ position: pos.times(TILE_SIZE), depth })
        )
    )
}

const makeTentInterior = (outside: Location, color: TentColor): Location => {
    // only the player should have a blue tent
    const isPlayerTent = color === "blue"
    const l = new Location(LocationType.TENT_INTERIOR, true, isPlayerTent)

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

    l.addElement(ElementType.BEDROLL, new Point(Math.floor(Math.random() * floorDimensions.x), 0))

    return LocationManager.instance.add(l)
}

export const tentInteriorSprite = ({ color }: { color: TentColor }) => {
    const render = Tilesets.instance.largeSprites
        .getTileSource("tent-interior")
        .filtered(getTentVariantImageFilter(color))
        .toImageRender(
            SpriteTransform.new({
                position: pt(0, -TILE_SIZE * 3),
                depth: Number.MIN_SAFE_INTEGER,
            })
        )
    return new Entity([new BasicRenderComponent(render)])
}
