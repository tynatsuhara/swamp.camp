import { Entity, Point } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { Location } from "../Location"
import { MultiTypeResidence } from "../residences/MultiTypeResidence"
import { TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"

type SimpleBuildingData = {
    interiorUUID: string
    residents: { [type: number]: string[] }
}

export class SimpleBuildingFactory extends BuildingFactory {
    readonly type: ElementType
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
        type: ElementType,
        dimensions: Point, // tile dimensions
        spriteTileSource: string,
        interiorSupplier: (outside: Location) => Location,
        colliderDimensions: Point,
        residenceCapacity: { [type: number]: number },
        doorHorizontalOffset = 0 // relative to the center
    ) {
        super()
        this.type = type
        this.dimensions = dimensions
        this.spriteTileSource = spriteTileSource
        this.interiorSupplier = interiorSupplier
        this.colliderDimensions = colliderDimensions
        this.residenceCapacity = residenceCapacity
        this.doorHorizontalOffset = doorHorizontalOffset
    }

    make(wl: Location, pos: Point, data: SimpleBuildingData): ElementComponent {
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
            (this.dimensions.x / 2) * TILE_SIZE + this.doorHorizontalOffset - 1,
            this.dimensions.y * TILE_SIZE - TILE_SIZE
        ).plus(pixelPos)

        // TODO make configurable?
        const doorId = TeleporterPrefix.DOOR

        wl.addTeleporter({
            to: interiorUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
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
                () => wl.playerUseTeleporter(interiorUUID, doorId),
                new Point(0, -TILE_SIZE * 1.4)
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
