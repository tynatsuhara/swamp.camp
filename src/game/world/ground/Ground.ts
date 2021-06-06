import { Point } from "../../../engine/Point"
import { WorldLocation } from "../WorldLocation"
import { GroundComponent } from "./GroundComponent"
import { makeGrass } from "./Grass"
import { makePath } from "./Path"
import { ConnectingTileSchema } from "../../../engine/tiles/ConnectingTileSchema"
import { Tilesets } from "../../graphics/Tilesets"
import { makeBasicNineSliceGround, makeBasicGround } from "./BasicGround"
import { makeLedge } from "./Ledge"

export const enum GroundType {
    BASIC, BASIC_NINE_SLICE, GRASS, PATH, LEDGE
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

    private static _instance: Ground
    static get instance(): Ground {
        if (!this._instance) {
            this._instance = new Ground()
        }
        return this._instance
    }

    private readonly GROUND_FUNCTION_MAP: { [key: number]: (data: MakeGroundFuncData) => GroundComponent } = {
        [GroundType.BASIC]: d => makeBasicGround(GroundType.BASIC, d, 0),
        [GroundType.BASIC_NINE_SLICE]: makeBasicNineSliceGround,
        [GroundType.GRASS]: makeGrass,
        [GroundType.PATH]: makePath,
        [GroundType.LEDGE]: makeLedge,
    }

    make(type: GroundType, wl: WorldLocation, pos: Point, data: object) {
        const ground = this.GROUND_FUNCTION_MAP[type]({wl, pos, data})
        if (ground.type !== type) {
            throw new Error("constructed ground type doesn't match requested type")
        }
        return ground
    }

    readonly PATH_CONNECTING_SCHEMA = new ConnectingTileSchema()
        .vertical(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
        .angle(Tilesets.instance.tilemap.getTileAt(new Point(0, 5)))
        .tShape(Tilesets.instance.tilemap.getTileAt(new Point(3, 5)))
        .plusShape(Tilesets.instance.tilemap.getTileAt(new Point(5, 5)))
        .cap(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
        .single(Tilesets.instance.tilemap.getTileAt(new Point(6, 5)))
} 
