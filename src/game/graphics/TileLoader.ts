import { TileSource } from "../../engine/tiles/TileSource"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"

export interface TileLoader {
    getTileSource(key: string): TileSource
    getTileSetAnimation(key: string, speed: number): TileSetAnimation
}