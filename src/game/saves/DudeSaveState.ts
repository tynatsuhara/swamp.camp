import { Point } from "../../engine/point"
import { DudeType } from "../characters/DudeFactory"

export class DudeSaveState {
    type: DudeType
    pos: Point
    // inventory: TODO
    maxHealth: number
    health: number
    // weapon: TODO  move weapon (and shield) to separate saveable structure
    // shield: TODO
}