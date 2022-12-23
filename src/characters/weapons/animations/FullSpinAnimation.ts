import { AnimationArgs, MeleeAnimation } from "./MeleeAnimation"

export class FullSpinAnimation extends MeleeAnimation {
    private timeElapsed = 0
    private readonly onFinish: () => void

    constructor(args: AnimationArgs, onFinish: () => void) {
        super(args)
        this.onFinish = onFinish
    }

    update(elapsedTimeMillis: number): void {
        this.timeElapsed += elapsedTimeMillis
        if (this.getAngle() >= 360) {
            this.onFinish()
        }
    }

    getFrame() {
        return [this.getFrameBase(this.getAngle())]
    }

    private getAngle() {
        const angle = Math.floor(this.timeElapsed / 0.85)
        return angle - (angle % 15)
    }
}
