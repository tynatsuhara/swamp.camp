export class Animator {
    private readonly frames: number[]  // a list of end-of-frame timestamps
    private readonly duration: number  // total duration
    private readonly fn: (index: number) => void

    private time: number = 0
    private index: number = 0

    /**
     * @param frames A list of frame durations
     * @param fn A callback that will be called each time a frame changes, passing the zero-based frame index
     */
    constructor(frames: number[], fn: (index: number) => void) {
        this.fn = fn

        this.frames = []
        let durationSoFar = 0
        frames.forEach((frameDuration: number) => {
            durationSoFar += frameDuration
            this.frames.push(durationSoFar)
        })
        this.duration = durationSoFar

        fn(0)
    }

    update(elapsedTimeMillis: number) {
        this.time += elapsedTimeMillis
        while (this.time > this.frames[this.index]) {
            this.index++
            this.index %= this.frames.length
            this.time %= this.duration
            this.fn(this.index)
        }
        return this.getCurrentFrame()
    }

    getCurrentFrame(): number {
        return this.index
    }
}