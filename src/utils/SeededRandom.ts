import { hash } from "./hash"

export class SeededRandom {
    private seed: number

    constructor(seed: string) {
        this.seed = hash(seed)
    }

    next() {
        var x = Math.sin(this.seed++) * 10000
        return x - Math.floor(x)
    }
}
