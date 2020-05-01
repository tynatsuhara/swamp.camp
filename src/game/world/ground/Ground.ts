import { Point } from "../../../engine/point"
import { WorldLocation } from "../WorldLocation"
import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { makeGrass } from "./Grass"
import { makePath } from "./Path"
import { ConnectingTileSchema } from "../../../engine/tiles/ConnectingTileSchema"
import { Tilesets } from "../../graphics/Tilesets"

export const enum GroundType {
    GRASS,
    PATH,
    WATER,
}

export class SavedGround {
    pos: Point
    type: GroundType
    obj: object
}

/**
 * Ground and elements are very similar, except that ground components are always 1x1
 */
export class Ground {

    static instance: Ground

    private readonly GROUND_FUNCTION_MAP: { [key: number]: (wl: WorldLocation, pos: Point, ...args: any[]) => GroundComponent } = {
        [GroundType.GRASS]: makeGrass,
        [GroundType.PATH]: makePath,
        // [GroundType.WATER]: makeTent,
    }

    make(type: GroundType, wl: WorldLocation, pos: Point, ...args: any[]) {
        return this.GROUND_FUNCTION_MAP[type](wl, pos, ...args)
    }

    constructor() {
        Ground.instance = this
    }

    readonly PATH_CONNECTING_SCHEMA = new ConnectingTileSchema()
        .vertical(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
        .angle(Tilesets.instance.tilemap.getTileAt(new Point(0, 5)))
        .tShape(Tilesets.instance.tilemap.getTileAt(new Point(3, 5)))
        .plusShape(Tilesets.instance.tilemap.getTileAt(new Point(5, 5)))
        .cap(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
        .single(Tilesets.instance.tilemap.getTileAt(new Point(7, 5)))
} 
