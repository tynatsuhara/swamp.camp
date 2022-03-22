import { assets } from "brigsby/dist/Assets"
import { Point } from "brigsby/dist/Point"
import { SpriteSource } from "brigsby/dist/sprites/SpriteSource"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Singletons } from "../Singletons"
import { DungeonTilesetII } from "./DungeonTilesetII"
import { ExplosionTileset } from "./ExplosionTileset"
import { ExtraCharacterSet2TileLoader } from "./ExtraCharacterSet2TileLoader"
import { LargeSpriteTileset } from "./LargeSpriteTileset"
import { OGTileset } from "./OGTileset"
import { OneBitTileset } from "./OneBitTileset"
import { OutdoorTileset } from "./OutdoorTileset"
import { SingleFileTileLoader } from "./SingleFileTileLoader"
import { SplitFileTileLoader } from "./SplitFileTileLoader"

// standard tile size
export const TILE_SIZE = 16
export const TILE_DIMENSIONS = new Point(TILE_SIZE, TILE_SIZE)

// returns the tile corresponding to the given pixel
export const pixelPtToTilePt = (pixelPt: Point) => {
    return pixelPt.apply((n) => Math.floor(n / TILE_SIZE))
}

const GLOBAL_VERSION_MAP_KEY = "SWAMP_CAMP_ASSETS"

// loaded before the the main menu is rendered
export const getFilesToLoadForMainMenu = () => {
    return [
        "images/title.png",
        "images/dungeon_base.png",
        "images/tilemap.png",
        "images/env_outdoor_recolor.png",
    ].map(versionize)
}

// loaded before the main menu will put the player into the game scene
export const getFilesToLoadForGame = () => {
    return Object.keys(window[GLOBAL_VERSION_MAP_KEY]).map(versionize)
}

// returns the image asset after applying the versionized hash
export const getImage = (fileName: string) => {
    return assets.getImageByFileName(versionize(fileName))
}

const versionize = (fileName: string) => {
    const hash = window[GLOBAL_VERSION_MAP_KEY][fileName]
    return `${fileName}?q=${hash}`
}

/**
 * Manages different tile sources
 */
export class Tilesets {
    static get instance() {
        return Singletons.getOrCreate(Tilesets)
    }

    readonly dungeonCharacters = new DungeonTilesetII()
    readonly tilemap = new OGTileset()
    readonly dungeonTiles = new SingleFileTileLoader("images/env_dungeon.png")
    readonly indoorTiles = new SingleFileTileLoader("images/env_indoor.png")
    readonly outdoorTiles = new OutdoorTileset()
    readonly oneBit = new OneBitTileset()
    readonly extraCharacterSet1 = new SplitFileTileLoader("images/individual_characters")
    readonly extraCharacterSet2 = new ExtraCharacterSet2TileLoader()
    readonly explosions = new ExplosionTileset()
    readonly largeSprites = new LargeSpriteTileset()

    getBasicTileSource(key: string): StaticSpriteSource {
        const sources = [this.outdoorTiles, this.tilemap, this.largeSprites]
        for (const src of sources) {
            try {
                return src.getTileSource(key)
            } catch (e) {}
        }
    }

    getBasicTileNineSlice(key: string): SpriteSource[] {
        const sources = [this.outdoorTiles, this.tilemap]
        for (const src of sources) {
            try {
                return src.getNineSlice(key)
            } catch (e) {}
        }
    }
}
