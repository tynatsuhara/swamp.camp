import { Point } from "./point"
import { UpdateData } from "./engine"
import { RenderImage } from "./renderer"

/**
 * An object which exists in the game world and updated by the engine. Should be attached to a game view.
 */
export abstract class Entity {
    position: Point  // "pixel" position

    constructor(position: Point) {
        this.position = position
    }

    /**
     * Called on each update step
     */
    update(updateData: UpdateData) {}

    /**
     * Returns a list of RenderImages, which will be rendered in order
     */
    abstract getRenderImages(): RenderImage[]
}