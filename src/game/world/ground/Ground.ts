import { Point } from "../../../engine/point"
import { WorldLocation } from "../WorldLocation"
import { GroundComponent } from "./GroundComponent"
import { makeGrass } from "./Grass"
import { makePath } from "./Path"
import { ConnectingTileSchema } from "../../../engine/tiles/ConnectingTileSchema"
import { Tilesets } from "../../graphics/Tilesets"
import { makeBasicNineSliceGround } from "./BasicGround"
import { makeLedge } from "./Ledge"

export const enum GroundType {
    GRASS, PATH, LEDGE, TENT_RED, TENT_BLUE
}

export class SavedGround {
    pos: string
    type: GroundType
    obj: object
}

export type MakeGroundFuncData = {
    wl: WorldLocation,
    pos: Point,
    data: object,
}

/**
 * Ground and elements are very similar, except that ground components are always 1x1
 */
export class Ground {

    static instance: Ground

    private readonly GROUND_FUNCTION_MAP: { [key: number]: (data: MakeGroundFuncData) => GroundComponent } = {
        [GroundType.GRASS]: makeGrass,
        [GroundType.PATH]: makePath,
        [GroundType.LEDGE]: makeLedge,
        [GroundType.TENT_RED]: (data) => { return makeBasicNineSliceGround(data, GroundType.TENT_RED, Tilesets.instance.outdoorTiles.getNineSlice("redtentInterior")) },
        [GroundType.TENT_BLUE]: (data) => { return makeBasicNineSliceGround(data, GroundType.TENT_BLUE, Tilesets.instance.outdoorTiles.getNineSlice("bluetentInterior")) },
    }

    make(type: GroundType, wl: WorldLocation, pos: Point, data: object) {
        const ground = this.GROUND_FUNCTION_MAP[type]({wl, pos, data})
        if (ground.type !== type) {
            throw new Error("constructed ground type doesn't match requested type")
        }
        return ground
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
