import { View } from "./view"
import { UpdateViewsContext } from "./engine"

export abstract class Game {
    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}