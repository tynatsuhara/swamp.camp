import { Point } from "brigsby/dist"
import { DudeType } from "../DudeType"
import { Lantern } from "./Lantern"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"
import { Torch } from "./Torch"

const offsetForDudeType = (type: DudeType) => {
    switch (type) {
        case DudeType.ORC_BRUTE:
            return new Point(2, -3)
        case DudeType.FOREST_GUARDIAN:
            return new Point(5, -4)
        default:
            return Point.ZERO
    }
}

export const ShieldFactory = {
    make(type: ShieldType, dudeType: DudeType): Shield {
        const offset = offsetForDudeType(dudeType)
        switch (type) {
            case ShieldType.NONE:
                return null
            case ShieldType.BASIC:
                return new Shield(type, "shield_0", offset)
            case ShieldType.LANTERN:
                return new Lantern()
            case ShieldType.TORCH:
                return new Torch()
            default:
                throw new Error(`weapon type ${type} is not supported yet`)
        }
    },
}
