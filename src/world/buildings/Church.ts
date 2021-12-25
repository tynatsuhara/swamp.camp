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
import { GroundType } from "../ground/Ground"
import { Location } from "../Location"
import { LocationManager, LocationType } from "../LocationManager"
import { SingleTypeResidence } from "../residences/SingleTypeResidence"
import { Teleporter, TeleporterPrefix } from "../Teleporter"
import { AsciiInteriorBuilder } from "./AsciiInteriorBuilder"
import { BuildingFactory } from "./Building"
import { InteriorUtils } from "./InteriorUtils"

type ChurchData = {
    interiorUUID: string
    nuns: string[]
    clerics: string[]
    bishops: string[]
}

export class ChurchFactory extends BuildingFactory {
    readonly type = ElementType.CHURCH
    readonly dimensions = new Point(5, 5)

    make(wl: Location, pos: Point, data: ChurchData): ElementComponent {
        const e = new Entity()
        const width = this.dimensions.x
        const height = this.dimensions.y

        // the interior location UUID
        const interiorUUID: string = data.interiorUUID ?? makeChurchInterior(wl).uuid

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
                () => wl.useTeleporter(interiorUUID, doorId),
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

const CHURCH_TEMPLATE = `
.......
...O...
.......
.__.__.
.......
.__.__.
.......
.__.__.
.......
   T   
`

const makeChurchInterior = (outside: Location): Location => {
    const l = new Location(LocationType.CHUCH_INTERIOR, true, false)

    LocationManager.instance.add(l)
    const dimensions = new Point(7, 9)
    const interactablePos = new Point(dimensions.x / 2, dimensions.y).times(TILE_SIZE)
    const teleporter: Teleporter = {
        to: outside.uuid,
        pos: interactablePos.plusY(-4),
        id: TeleporterPrefix.DOOR,
    }

    l.setBarriers(InteriorUtils.makeBarriers(dimensions))
    l.addTeleporter(teleporter)

    new AsciiInteriorBuilder(CHURCH_TEMPLATE)
        .map("O", (pos) => l.addElement(ElementType.PODIUM, pos))
        .map("_", (pos) => l.addElement(ElementType.BENCH, pos))
        .map("T", (pos) =>
            l.addElement(ElementType.TELEPORTER, pos, {
                to: outside.uuid,
                i: interactablePos.toString(),
                id: TeleporterPrefix.DOOR,
            })
        )

    const woodType = Math.ceil(Math.random() * 2)

    const addWallSprite = (key: string, pt: Point, rotation: number) => {
        l.sprites.addSprite(key, pt.times(TILE_SIZE), rotation, -100000)
    }

    // walls
    for (let x = 0; x < dimensions.x; x++) {
        for (let y = 0; y < dimensions.y; y++) {
            l.setGroundElement(GroundType.BASIC, new Point(x, y), {
                k: `hardwood${woodType}`,
            })
        }
        let topAndBottomTiles = ["wallCenter", "wallCenter"]
        if (x === 0) {
            topAndBottomTiles = ["wallLeft", "wallRight"]
        } else if (x === dimensions.x - 1) {
            topAndBottomTiles = ["wallRight", "wallLeft"]
        }
        addWallSprite(topAndBottomTiles[0], new Point(x, -1), 0)
        addWallSprite(topAndBottomTiles[1], new Point(x, -2), 180)
    }

    return l
}
