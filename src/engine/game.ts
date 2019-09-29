import { View } from "./view"
import { UpdateData } from "./engine";

export abstract class Game {
    abstract getViews(updateData: UpdateData): View[]
}