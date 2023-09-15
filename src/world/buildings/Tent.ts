import { Entity, Point, pt } from "brigsby/dist"
import { SpriteComponent, SpriteTransform } from "brigsby/dist/sprites"
import { Sounds } from "../../audio/Sounds"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { ItemMetadata } from "../../items/Items"
import { TentColor, TentData, getTentVariantImageFilter } from "../../items/TentVariants"
import { TeleporterSounds } from "../Teleporter"
import { Breakable } from "../elements/Breakable"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { BasicLocation } from "../locations/BasicLocation"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { LocationType } from "../locations/LocationType"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { BuildingFactory, ConstructionRequirements } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

export const DIP_TENT_COLOR = "red"
export const PLAYER_TENT_COLOR = "blue"

export class TentFactory extends BuildingFactory<ElementType.TENT, TentData> {
    readonly dimensions = new Point(4, 3)

    constructor() {
        super(ElementType.TENT)
    }

    makeBuilding(
        wl: Location,
        pos: Point,
        { color = "taupe", destinationUUID = makeTentInterior(wl, color).uuid, residents = [] }
    ) {
        const e = new Entity()

        const tentCenterPos = pos.plus(new Point(2, 1)).times(TILE_SIZE)
        const interactablePos = tentCenterPos.plusY(TILE_SIZE)
        LocationManager.instance.setTeleporter(
            destinationUUID,
            "a",
            {
                location: wl.uuid,
                pos: interactablePos.plusY(12),
            },
            "tent"
        )

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
                () => LocationManager.instance.playerUseTeleporter(destinationUUID),
                new Point(1, -TILE_SIZE * 1.4)
            )
        )

        // NOTE: Right now, the residence only works for player and Dip, since those are the only real use cases
        const dudeTypeForResidence = {
            [DIP_TENT_COLOR]: DudeType.DIP,
            [PLAYER_TENT_COLOR]: DudeType.PLAYER,
        }[color]

        const residence = e.addComponent(
            new SingleTypeResidence(dudeTypeForResidence, 1, destinationUUID, residents)
        )

        const getSaveData: () => TentData = () => ({
            color,
            destinationUUID,
            residents: residence.getResidentUUIDs(),
        })

        e.addComponent(
            new Breakable(
                interactablePos,
                tiles.map((t) => t.transform),
                () => {
                    // side effect: eject people inside
                    const tp = LocationManager.instance.findTeleporter(wl.uuid, destinationUUID)
                    // TODO this seems broken
                    LocationManager.instance.get(destinationUUID).ejectResidents(tp.id)

                    return [{ item: Item.TENT, metadata: getSaveData() }]
                },
                () => Sounds.playAtPoint(...TeleporterSounds.TENT, tentCenterPos),
                10
            )
        )

        return e.addComponent(new ElementComponent(ElementType.TENT, pos, getSaveData))
    }

    canPlaceInLocation(l: Location) {
        return !l.isInterior
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
            residents: metadata.residents,
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
    const isPlayerTent = color === PLAYER_TENT_COLOR
    const isDipTent = color === DIP_TENT_COLOR
    const l = new BasicLocation({
        type: LocationType.TENT_INTERIOR,
        isInterior: true,
        allowPlacing: isPlayerTent,
    })

    const floorDimensions = new Point(4, 3)
    InteriorUtils.setWalkableTiles(l, floorDimensions)

    const interactablePos = new Point(floorDimensions.x / 2, floorDimensions.y).times(TILE_SIZE)
    InteriorUtils.addBarriers(l, floorDimensions)
    InteriorUtils.addTeleporter(l, interactablePos, pt(-TILE_SIZE / 2, 0), "tent")

    l.addFeature("tentInteriorSprite", { color })

    l.addElement(ElementType.BEDROLL, new Point(Math.floor(Math.random() * floorDimensions.x), 0))

    return LocationManager.instance.add(l)
}
