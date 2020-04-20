import { TileSource } from "./TileSource";

export class TileSetAnimation {
    readonly frames: [TileSource, number][]; // a list of (source, end-of-frame timestamp)
    readonly duration: number;
    
    /**
     * @param frames A list of tile sources and a duration in milliseconds that each one will last
     */
    constructor(frames: [TileSource, number][]) {
        this.frames = [];
        let timestamp = 0;
        frames.forEach((frame: [TileSource, number]) => {
            timestamp += frame[1];
            this.frames.push([frame[0], timestamp]);
        });
        this.duration = timestamp;
    }
}
