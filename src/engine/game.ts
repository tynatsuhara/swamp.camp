import { View } from "./View"
import { UpdateViewsContext } from "./engine"

export abstract class Game {
    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}