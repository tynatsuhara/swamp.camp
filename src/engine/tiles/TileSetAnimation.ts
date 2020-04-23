import { TileSource } from "./TileSource"

export class TileSetAnimation {
    readonly frames: [TileSource, number][]; // a list of (source, duration)
    
    /**
     * @param frames A list of tile sources and a duration in milliseconds that each one will last
     */
    constructor(frames: [TileSource, number][]) {
        this.frames = frames
    }

    getTile(index: number) {
        return this.frames[index][0]
    }
}
