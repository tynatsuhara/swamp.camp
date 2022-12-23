import { MeleeAnimation } from "./MeleeAnimation"

export class IdleAnimation extends MeleeAnimation {
    getFrame() {
        return [this.getFrameBase(0)]
    }
}
