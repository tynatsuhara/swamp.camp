import { pt } from "brigsby/dist/Point"
import { MeleeAnimation } from "./MeleeAnimation"

export class SheathedAnimation extends MeleeAnimation {
    getFrame() {
        const { sprite, transform } = this.getFrameBase(0, pt(3, -1), true)
        transform.mirrorY = true
        transform.depth = -0.5
        return [{ sprite, transform }]
    }
}
