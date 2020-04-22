import { View } from "./View"
import { UpdateViewsContext } from "./engine"

export abstract class Game {

    initialize() {}

    abstract getViews(updateViewsContext: UpdateViewsContext): View[]
}