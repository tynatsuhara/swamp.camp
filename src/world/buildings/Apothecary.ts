import { BoxCollider } from "brigsby/dist/collision/BoxCollider"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { DudeType } from "../../characters/DudeFactory"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementType } from "../elements/Elements"
import { ElementUtils } from "../elements/ElementUtils"
import { Interactable } from "../elements/Interactable"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type ChurchData = {
    interiorUUID: string
    nuns: string[]
    clerics: string[]
    bishops: string[]
}

export class ApothecaryFactory extends BuildingFactory {
    readonly type = ElementType.APOTHECARY
    readonly dimensions = new Point(5, 5)

    make(wl: Location, pos: Point, data: ChurchData): ElementComponent {
        const e = new Entity()
        const width = this.dimensions.x
        const height = this.dimensions.y

        // the interior location UUID
        const interiorUUID: string = data.interiorUUID ?? makeApothecaryInterior(wl).uuid

        const interactablePos = pos.plus(new Point(width / 2, height)).times(TILE_SIZE)
        const doorId = TeleporterPrefix.DOOR

        // TODO: Can we combine this with the interactable step below?
        wl.addTeleporter({
            to: interiorUUID,
            pos: interactablePos.plusY(12),
            id: doorId,
        })

        const basePos = pos.plusX(1) // accounting for 1 tile of space on sides
        const depth = (pos.y + height) * TILE_SIZE

        // Set up sprite
        e.addComponent(
            Tilesets.instance.largeSprites.getTileSource("church").toComponent(
                SpriteTransform.new({
                    position: basePos.times(TILE_SIZE),
                    depth,
                })
            )
        )

        // Set up collider
        e.addComponent(
            new BoxCollider(
                basePos.plusY(3).times(TILE_SIZE),
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

        const nunsRez = e.addComponent(
            new SingleTypeResidence(DudeType.NUN, 3, interiorUUID, data.nuns || [])
        )
        const clericsRez = e.addComponent(
            new SingleTypeResidence(DudeType.CLERIC, 3, interiorUUID, data.clerics || [])
        )
        const bishopsRez = e.addComponent(
            new SingleTypeResidence(DudeType.BISHOP, 1, interiorUUID, data.bishops || [])
        )

        const save: () => ChurchData = () => ({
            interiorUUID,
            nuns: nunsRez.getResidents(),
            clerics: clericsRez.getResidents(),
            bishops: bishopsRez.getResidents(),
        })

        return e.addComponent(
            new ElementComponent(this.type, pos, this.getOccupiedPoints(pos), save)
        )
    }

    getOccupiedPoints(pos: Point) {
        return ElementUtils.rectPoints(pos.plus(new Point(1, 3)), new Point(3, 2))
    }
}

const makeApothecaryInterior = (outside: Location): Location => {
    const l = new Location(LocationType.APOTHECARY_INTERIOR, true, false)

    LocationManager.instance.add(l)
    const dimensions = new Point(4, 4)
    const interactablePos = new Point(1, 4).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    }

    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter(teleporter)

    l.sprites.addSprite("dr-interior", new Point(0, -TILE_SIZE * 2), 0, Number.MIN_SAFE_INTEGER)
    // l.sprites.addSprite("skeleton", new Point(0, -TILE_SIZE * 2), 0)

    l.sprites.addSprite("dr-counter", new Point(TILE_SIZE, TILE_SIZE), 0, TILE_SIZE)

    return l
}
