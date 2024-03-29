import { Entity, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"
import { MultiTypeResidence } from "../residences/MultiTypeResidence"
import { BuildingFactory } from "./Building"
import { interactableDoorIconSupplier } from "./BuildingUtils"

type SimpleBuildingData = {
    interiorUUID: string
    residents: { [type: number]: string[] }
}

export class SimpleBuildingFactory<Type extends ElementType> extends BuildingFactory<Type> {
    readonly dimensions: Point

    private readonly spriteTileSource: string
    private readonly interiorSupplier: (outside: Location) => Location
    private readonly colliderDimensions: Point
    private readonly residenceCapacity: { [type: number]: number }
    private readonly doorHorizontalOffset: number

    /**
     * Simple buildings adhere to certain rules:
     *   * The sprites are aligned to the bottom center, with 1 tile of padding
     *   * The exterior is a single sprite from @see Tilesets.instance.largeSprites
     *   * Has a single door along the bottom
     */
    constructor(
        type: Type,
        dimensions: Point, // tile dimensions
        spriteTileSource: string,
        interiorSupplier: (outside: Location) => Location,
        colliderDimensions: Point,
        residenceCapacity: { [type: number]: number },
        doorHorizontalOffset = 0 // relative to the center
    ) {
        super(type)
        this.dimensions = dimensions
        this.spriteTileSource = spriteTileSource
        this.interiorSupplier = interiorSupplier
        this.colliderDimensions = colliderDimensions
        this.residenceCapacity = residenceCapacity
        this.doorHorizontalOffset = doorHorizontalOffset
    }

    makeBuilding(wl: Location, pos: Point, data: SimpleBuildingData) {
        const e = new Entity()

        // the interior location UUID
        const interiorUUID: string = data.interiorUUID ?? this.interiorSupplier(wl).uuid

        const sprite = Tilesets.instance.largeSprites.getTileSource(this.spriteTileSource)

        const pixelPos = pos.times(TILE_SIZE)

        const spritePos = new Point(
            (this.dimensions.x / 2) * TILE_SIZE - sprite.dimensions.x / 2,
            this.dimensions.y * TILE_SIZE - TILE_SIZE - sprite.dimensions.y
        ).plus(pixelPos)

        const interactablePos = new Point(
            (this.dimensions.x / 2) * TILE_SIZE + this.doorHorizontalOffset,
            this.dimensions.y * TILE_SIZE - TILE_SIZE
        ).plus(pixelPos)

        LocationManager.instance.setTeleporter(interiorUUID, "a", {
            location: wl.uuid,
            pos: interactablePos.plusY(12),
        })

        const depth = interactablePos.y

        // Set up sprite
        e.addComponent(
            sprite.toComponent(
                SpriteTransform.new({
                    position: spritePos,
                    depth,
                })
            )
        )

        // Set up collider
        const colliderPos = new Point(
            (this.dimensions.x / 2) * TILE_SIZE - this.colliderDimensions.x / 2,
            this.dimensions.y * TILE_SIZE - TILE_SIZE - this.colliderDimensions.y
        ).plus(pixelPos)
        e.addComponent(new NavMeshCollider(wl, colliderPos, this.colliderDimensions))

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                // TODO: Allow doors to be locked? Maybe say "the hours are between X and Y" if it's a shop
                () => LocationManager.instance.playerUseTeleporter(interiorUUID),
                new Point(0, -TILE_SIZE * 1.4),
                undefined,
                interactableDoorIconSupplier(interiorUUID)
            )
        )

        const rez = e.addComponent(
            new MultiTypeResidence(this.residenceCapacity, interiorUUID, data.residents ?? {})
        )

        const save: () => SimpleBuildingData = () => ({
            interiorUUID,
            residents: rez.getResidents(),
        })

        return e.addComponent(new ElementComponent(this.type, pos, save))
    }
}
