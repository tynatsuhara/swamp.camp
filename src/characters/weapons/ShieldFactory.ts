import { Lantern } from "./Lantern"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"
import { Torch } from "./Torch"

export const ShieldFactory = {
    // TODO support additional weapons
    make(type: ShieldType): Shield {
        switch (type) {
            case ShieldType.NONE:
                return null
            case ShieldType.BASIC:
                return new Shield(type, "shield_0")
            case ShieldType.LANTERN:
                return new Lantern()
            case ShieldType.TORCH:
                return new Torch()
            default:
                throw new Error(`weapon type ${type} is not supported yet`)
        }
    },
}
