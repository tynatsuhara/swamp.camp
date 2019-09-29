import { Point } from "./point"
import { CapturedInput, InputKey } from "./input"
import { UpdateData } from "./engine";
import { RenderImage } from "./renderer";

export abstract class Entity {
    position: Point  // "pixel" position (according to the sprite sheet)

    constructor(position: Point) {
        this.position = position
    }

    update(updateData: UpdateData) {}

    abstract getRenderImage(): RenderImage
}