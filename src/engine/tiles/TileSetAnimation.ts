import { StaticTileSource } from "./StaticTileSource"
import { TileSource } from "./TileSource"
import { TileTransform } from "./TileTransform"
import { Point } from "../point"
import { TileComponent } from "./TileComponent"
import { AnimatedTileComponent } from "./AnimatedTileComponent"

// TODO rename this to align with the interface
export class TileSetAnimation implements TileSource {
    readonly frames: [StaticTileSource, number][]; // a list of (source, duration)
    
    /**
     * @param frames A list of tile sources and a duration in milliseconds that each one will last
     */
    constructor(frames: [StaticTileSource, number][]) {
        this.frames = frames
    }

    getTile(index: number) {
        return this.frames[index][0]
    }

    toComponent(transform: TileTransform = new TileTransform()): TileComponent {
        return new AnimatedTileComponent([this])
    }

    filtered(filter: (img: ImageData) => void): TileSetAnimation {
        return new TileSetAnimation(this.frames.map(f => [f[0].filtered(filter), f[1]]))
    }
}
