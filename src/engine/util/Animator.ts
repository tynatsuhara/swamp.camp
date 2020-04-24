export class Animator {    
    private readonly frames: number[]  // a list of end-of-frame timestamps
    private readonly duration: number  // total duration

    // callbacks
    private readonly onFrameChange: (index: number) => void
    private readonly onFinish: () => void  // called when the last frame finishes

    private time: number = 0
    private index: number = 0

    /**
     * @param frames A list of frame durations
     * @param fn A callback that will be called each time a frame changes, passing the zero-based frame index
     */
    constructor(
        frames: number[], 
        onFrameChange: (index: number) => void = () => {},
        onFinish: () => void = () => {},
    ) {
        this.onFrameChange = onFrameChange
        this.onFinish = onFinish

        this.frames = []
        let durationSoFar = 0
        frames.forEach((frameDuration: number) => {
            durationSoFar += frameDuration
            this.frames.push(durationSoFar)
        })
        this.duration = durationSoFar

        this.update(0)
    }

    update(elapsedTimeMillis: number) {
        this.time += elapsedTimeMillis
        while (this.time > this.frames[this.index]) {
            this.index++

            if (this.index === this.frames.length) {
                this.onFinish()
            }

            this.index %= this.frames.length
            this.time %= this.duration
            this.onFrameChange(this.index)
        }
    }

    getCurrentFrame(): number {
        return this.index
    }

    static frames(count: number, msPerFrame: number) {
        const result = []
        for (let i = 0; i < count; i++) {
            result.push(msPerFrame)
        }
        return result
    }
}