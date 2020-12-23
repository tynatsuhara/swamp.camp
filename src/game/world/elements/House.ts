import { Point } from "../../../engine/point"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { WorldLocation } from "../WorldLocation"
import { TileComponent } from "../../../engine/tiles/TileComponent"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Entity } from "../../../engine/Entity"
import { ElementComponent } from "./ElementComponent"
import { ElementType } from "./Elements"
import { ElementUtils } from "./ElementUtils"
import { Component } from "../../../engine/component"
import { ElementFactory } from "./ElementFactory"

/**
 * At runtime, a building exterior consists of several components:
 *   1. Tiles, the visual component
 *   2. A collider
 *   3. A door teleporter
 * Data that is saved:
 *   1. Element type
 *   2. "Occupied points" which determines occupied squares in the world grid
 *   3. Misc metadata about the building
 */
export class HouseFactory extends ElementFactory {

    readonly type = ElementType.HOUSE
    readonly dimensions = new Point(5, 4)

    make(wl: WorldLocation, pos: Point, data: object): ElementComponent {    
        const e = new Entity()

        // TODO: replace with house interior
        // const destinationUUID: string = data["destinationUUID"] ?? makeTentInterior(wl, TentColor.RED).uuid

        // const interactablePos = pos.plus(new Point(2, 2)).times(TILE_SIZE)
        // const sourceTeleporter = { to: destinationUUID, pos: interactablePos.plusY(12) }
        // wl.addTeleporter(sourceTeleporter)
        
        // Set up tiles
        const depth = (pos.y + 3) * TILE_SIZE

        const addTile = (tileSheetPos: Point, pos: Point) => {
            const tile = Tilesets.instance.tilemap.getTileAt(tileSheetPos)
            const el = e.addComponent(new TileComponent(tile, new TileTransform(pos.times(TILE_SIZE))))
            el.transform.depth = depth
        }

        // flat roof
        const flatRoofTopLeft = new Point(6, 0)
        const basePos = pos.plusX(1)
        addTile(flatRoofTopLeft.plusX(1), basePos)
        addTile(flatRoofTopLeft.plusX(2), basePos.plusX(1))
        addTile(flatRoofTopLeft.plusX(3), basePos.plusX(2))
        addTile(flatRoofTopLeft.plusY(2).plusX(1), basePos.plusY(1))
        addTile(flatRoofTopLeft.plusY(2).plusX(2), basePos.plusY(1).plusX(1))
        addTile(flatRoofTopLeft.plusY(2).plusX(3), basePos.plusY(1).plusX(2))

        // door
        addTile(new Point(7, 6), basePos.plusY(2).plusX(1))

        // no windows
        addTile(new Point(7, 5), basePos.plusY(2))
        addTile(new Point(9, 5), basePos.plusY(2).plusX(2))

        // alternative with windows
        // addTile(new Point(5, 6), basePos.plusY(2))
        // addTile(new Point(6, 6), basePos.plusY(2).plusX(2))

        e.addComponent(new BoxCollider(basePos.plus(new Point(0, 1)).times(TILE_SIZE), new Point(TILE_SIZE*3, TILE_SIZE*2)))


        // Set up teleporter
        // e.addComponent(new Interactable(interactablePos, () => wl.useTeleporter(destinationUUID), new Point(1, -TILE_SIZE*1.4)))

        const resident = data[House.RESIDENT_ATTRIBUTE]
        const house = e.addComponent(new House())
        house.setResident(resident)

        return e.addComponent(new ElementComponent(
            ElementType.HOUSE, 
            pos,
            ElementUtils.rectPoints(pos, new Point(5, 4)),
            () => ({
                RESIDENT_ATTRIBUTE: house.getResident()
            })
        ))
    }
}

export class House extends Component {
    static readonly RESIDENT_ATTRIBUTE = "rez"
    private static readonly PENDING_RESIDENT = "pending"

    private resident: string;

    hasResident() {
        return !!this.resident
    }

    setResidentPending() {
        this.resident = House.PENDING_RESIDENT
    }

    setResident(uuid: string) {
        this.resident = uuid
    }

    getResident() {
        return this.resident
    }
}