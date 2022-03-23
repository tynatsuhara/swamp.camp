import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DudeType } from "../../characters/DudeFactory"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type ApothecaryData = {
    interiorUUID: string
    residents: string[]
}

export class ApothecaryFactory extends BuildingFactory {
    readonly type = ElementType.APOTHECARY
    readonly dimensions = new Point(5, 4)

    make(wl: Location, pos: Point, data: ApothecaryData): ElementComponent {
        const e = new Entity()

        // the interior location UUID
        const interiorUUID: string = data.interiorUUID ?? makeApothecaryInterior(wl).uuid

        // spriteTilePos accounts for 1 tile of space on sides and the roof
        const spriteTilePos = pos.plusX(1).plusY(-2)
        const interactablePos = spriteTilePos.plus(new Point(1, 5)).times(TILE_SIZE).plusX(-1)
        const doorId = TeleporterPrefix.DOOR

        // TODO: Can we combine this with the interactable step below?
        wl.addTeleporter({
            to: interiorUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        })

        const depth = (spriteTilePos.y + 5) * TILE_SIZE

        // Set up sprite
        e.addComponent(
            Tilesets.instance.largeSprites.getTileSource("apothecary").toComponent(
                SpriteTransform.new({
                    position: spriteTilePos.times(TILE_SIZE),
                    depth,
                })
            )
        )

        // Set up collider
        e.addComponent(
            new NavMeshCollider(
                wl,
                spriteTilePos.plusY(3).times(TILE_SIZE),
                new Point(TILE_SIZE * 3, TILE_SIZE * 2)
            )
        )

        // Set up teleporter
        e.addComponent(
            new Interactable(
                interactablePos,
                () => wl.playerUseTeleporter(interiorUUID, doorId),
                new Point(0, -TILE_SIZE * 1.4)
            )
        )

        const rez = e.addComponent(
            new SingleTypeResidence(DudeType.DOCTOR, 1, interiorUUID, data.residents || [])
        )

        const save: () => ApothecaryData = () => ({
            interiorUUID,
            residents: rez.getResidents(),
        })

        return e.addComponent(new ElementComponent(this.type, pos, save))
    }
}

// TODO below

const makeApothecaryInterior = (outside: Location): Location => {
    const l = new Location(LocationType.APOTHECARY_INTERIOR, true, false)

    LocationManager.instance.add(l)
    const dimensions = new Point(4, 3)

    ElementUtils.rectPoints(Point.ZERO, dimensions).forEach((p) =>
        l.setGroundElement(GroundType.BASIC, p)
    )

    const interactablePos = new Point(1.5, 3).times(TILE_SIZE)
    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter({
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    })
    l.addElement(ElementType.TELEPORTER_INDICATOR, new Point(1, 3), {
        to: outside.uuid,
        i: interactablePos.toString(),
        id: TeleporterPrefix.DOOR,
    })

    l.sprites.addSprite("dr-interior", new Point(0, -TILE_SIZE * 2), 0, Number.MIN_SAFE_INTEGER)

    const skeletonPos = new Point(3, 1).times(TILE_SIZE)
    l.sprites.addSprite("skeleton", skeletonPos, 0, skeletonPos.y + TILE_SIZE * 2 - 4)

    // TODO: add counter collider..... this is annoying
    const counterPos = new Point(TILE_SIZE, 6)
    l.sprites.addSprite("dr-counter", counterPos, 0, counterPos.y + TILE_SIZE)

    return l
}
