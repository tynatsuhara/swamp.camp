import { Point } from "brigsby/dist/Point"
import { Singletons } from "../../Singletons"
import { Location } from "../Location"
import { makeBasicGround, makeBasicNineSliceGround } from "./BasicGround"
import { makeGrass } from "./Grass"
import { GroundComponent } from "./GroundComponent"
import { makeLedge } from "./Ledge"
import { makePath } from "./Path"
import { makeWater } from "./Water"
import { makeWaterfall } from "./Waterfall"

export enum GroundType {
    BASIC,
    BASIC_NINE_SLICE,
    GRASS,
    PATH,
    LEDGE,
    WATER,
    WATERFALL,
}

export class SavedGround {
    pos: string
    type: GroundType
    obj: object
}

export type MakeGroundFuncData = {
    wl: Location
    pos: Point
    data: any
}

/**
 * Ground and elements are very similar, except that ground components are always 1x1
 */
export class Ground {
    static get instance() {
        return Singletons.getOrCreate(Ground)
    }

    private readonly GROUND_FUNCTION_MAP: {
        [key: number]: (data: MakeGroundFuncData) => GroundComponent
    } = {
        [GroundType.BASIC]: makeBasicGround,
        [GroundType.BASIC_NINE_SLICE]: makeBasicNineSliceGround,
        [GroundType.GRASS]: makeGrass,
        [GroundType.PATH]: makePath,
        [GroundType.LEDGE]: makeLedge,
        [GroundType.WATER]: makeWater,
        [GroundType.WATERFALL]: makeWaterfall,
    }

    make(type: GroundType, wl: Location, pos: Point, data: object) {
        const ground = this.GROUND_FUNCTION_MAP[type]({ wl, pos, data })
        if (ground.type !== type) {
            throw new Error("constructed ground type doesn't match requested type")
        }
        return ground
    }

    /**
     * used for particles and sinking effects
     */
    static isWater(type: GroundType) {
        return type === GroundType.WATER || type === GroundType.WATERFALL
    }

    /**
     * used for placing things
     */
    static isNaturalGround(type: GroundType) {
        return type === GroundType.GRASS || type === GroundType.PATH
    }
}
