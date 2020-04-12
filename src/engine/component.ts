import { UpdateData, StartData } from "./engine";
import { Entity } from "./entity";
import { RenderImage } from "./renderer";

export abstract class Component {

    entity: Entity

    /**
     * Called once, after the component is added to a valid entity and before update() is called
     */
    start(startData: StartData) {}

    /**
     * Called on each update step
     */
    update(updateData: UpdateData) {}

    /**
     * Should be overridden by renderable components
     */
    getRenderImages(): RenderImage[] {
        return []
    }
}
