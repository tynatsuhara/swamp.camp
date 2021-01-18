import { SingleFileTileLoader } from "./SingleFileTileLoader"
import { DungeonTilesetII } from "./DungeonTilesetII"
import { SplitFileTileLoader } from "./SplitFileTileLoader"
import { OneBitTileset } from "./OneBitTileset"
import { OutdoorTileset } from "./OutdoorTileset"
import { Point } from "../../engine/point"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileSource } from "../../engine/tiles/TileSource"
import { ExtraCharacterSet2TileLoader } from "./ExtraCharacterSet2TileLoader"
import { OGTileset } from "./OGTileset"

// standard tile size
export const TILE_SIZE = 16
export const TILE_DIMENSIONS = new Point(TILE_SIZE, TILE_SIZE)

export const pixelPtToTilePt = (pixelPt: Point) => {
    return pixelPt.apply(n => Math.floor(n/TILE_SIZE))
}

/**
 * Manages different tile sources
 */
export class Tilesets {

    private static _instance: Tilesets
    static get instance(): Tilesets {
        if (!this._instance) {
            this._instance = new Tilesets()
        }
        return this._instance
    }

    readonly dungeonCharacters = new DungeonTilesetII()
    readonly tilemap = new OGTileset()
    readonly dungeonTiles = new SingleFileTileLoader("images/env_dungeon.png")
    readonly indoorTiles = new SingleFileTileLoader("images/env_indoor.png")
    readonly outdoorTiles = new OutdoorTileset()
    readonly oneBit = new OneBitTileset()
    readonly extraCharacterSet1 = new SplitFileTileLoader("images/individual_characters")
    readonly extraCharacterSet2 = new ExtraCharacterSet2TileLoader()

    private constructor() {
        // not allowed
    }

    getBasicTileSource(key: string): StaticTileSource {
        const sources = [this.outdoorTiles, this.tilemap]
        for (const src of sources) {
            try {
                return src.getTileSource(key)
            } catch (e) {}
        }
    }

    getBasicTileNineSlice(key: string): TileSource[] {
        const sources = [this.outdoorTiles, this.tilemap]
        for (const src of sources) {
            try {
                return src.getNineSlice(key)
            } catch (e) {}
        }
    }

    // loaded before the engine starts running the game
    static getFilesToLoad() {
        return [
            "images/monochrome_transparent_1_bit.png",
            "images/dungeon_base.png",
            "images/env_dungeon.png",
            "images/env_indoor.png",
            "images/env_outdoor.png",
            "images/env_outdoor_recolor.png",
            "images/tilemap.png",
            "images/extra_characters.png",
            "images/individual_characters/Alchemist_Idle_1.png",
            "images/individual_characters/Alchemist_Idle_2.png",
            "images/individual_characters/Alchemist_Idle_3.png",
            "images/individual_characters/Alchemist_Idle_4.png",
            "images/individual_characters/Alchemist_Walk_1.png",
            "images/individual_characters/Alchemist_Walk_2.png",
            "images/individual_characters/Alchemist_Walk_3.png",
            "images/individual_characters/Alchemist_Walk_4.png",
            "images/individual_characters/Archer_Idle_1.png",
            "images/individual_characters/Archer_Idle_2.png",
            "images/individual_characters/Archer_Idle_3.png",
            "images/individual_characters/Archer_Idle_4.png",
            "images/individual_characters/Archer_Walk_1.png",
            "images/individual_characters/Archer_Walk_2.png",
            "images/individual_characters/Archer_Walk_3.png",
            "images/individual_characters/Archer_Walk_4.png",
            "images/individual_characters/Bandit_Idle_1.png",
            "images/individual_characters/Bandit_Idle_2.png",
            "images/individual_characters/Bandit_Idle_3.png",
            "images/individual_characters/Bandit_Idle_4.png",
            "images/individual_characters/Bandit_Walk_1.png",
            "images/individual_characters/Bandit_Walk_2.png",
            "images/individual_characters/Bandit_Walk_3.png",
            "images/individual_characters/Bandit_Walk_4.png",
            "images/individual_characters/Bear_Idle_1.png",
            "images/individual_characters/Bear_Idle_2.png",
            "images/individual_characters/Bear_Idle_3.png",
            "images/individual_characters/Bear_Idle_4.png",
            "images/individual_characters/Bear_Walk_1.png",
            "images/individual_characters/Bear_Walk_2.png",
            "images/individual_characters/Bear_Walk_3.png",
            "images/individual_characters/Bear_Walk_4.png",
            // "images/individual_characters/Bishop_Idle + Walk_1.png",
            // "images/individual_characters/Bishop_Idle + Walk_2.png",
            // "images/individual_characters/Bishop_Idle + Walk_3.png",
            // "images/individual_characters/Bishop_Idle + Walk_4.png",
            "images/individual_characters/Blacksmith_Idle_1.png",
            "images/individual_characters/Blacksmith_Idle_2.png",
            "images/individual_characters/Blacksmith_Idle_3.png",
            "images/individual_characters/Blacksmith_Idle_4.png",
            "images/individual_characters/Blacksmith_Walk_1.png",
            "images/individual_characters/Blacksmith_Walk_2.png",
            "images/individual_characters/Blacksmith_Walk_3.png",
            "images/individual_characters/Blacksmith_Walk_4.png",
            "images/individual_characters/Butcher_Idle_1.png",
            "images/individual_characters/Butcher_Idle_2.png",
            "images/individual_characters/Butcher_Idle_3.png",
            "images/individual_characters/Butcher_Idle_4.png",
            "images/individual_characters/Butcher_Walk_1.png",
            "images/individual_characters/Butcher_Walk_2.png",
            "images/individual_characters/Butcher_Walk_3.png",
            "images/individual_characters/Butcher_Walk_4.png",
            "images/individual_characters/Centaur_F_Idle_1.png",
            "images/individual_characters/Centaur_F_Idle_2.png",
            "images/individual_characters/Centaur_F_Idle_3.png",
            "images/individual_characters/Centaur_F_Idle_4.png",
            "images/individual_characters/Centaur_F_Walk_1.png",
            "images/individual_characters/Centaur_F_Walk_2.png",
            "images/individual_characters/Centaur_F_Walk_3.png",
            "images/individual_characters/Centaur_F_Walk_4.png",
            "images/individual_characters/Centaur_M_Idle_1.png",
            "images/individual_characters/Centaur_M_Idle_2.png",
            "images/individual_characters/Centaur_M_Idle_3.png",
            "images/individual_characters/Centaur_M_Idle_4.png",
            "images/individual_characters/Centaur_M_Walk_1.png",
            "images/individual_characters/Centaur_M_Walk_2.png",
            "images/individual_characters/Centaur_M_Walk_3.png",
            "images/individual_characters/Centaur_M_Walk_4.png",
            "images/individual_characters/Elf_F_Idle_1.png",
            "images/individual_characters/Elf_F_Idle_2.png",
            "images/individual_characters/Elf_F_Idle_3.png",
            "images/individual_characters/Elf_F_Idle_4.png",
            "images/individual_characters/Elf_F_Walk_1.png",
            "images/individual_characters/Elf_F_Walk_2.png",
            "images/individual_characters/Elf_F_Walk_3.png",
            "images/individual_characters/Elf_F_Walk_4.png",
            "images/individual_characters/Elf_M_Idle_1.png",
            "images/individual_characters/Elf_M_Idle_2.png",
            "images/individual_characters/Elf_M_Idle_3.png",
            "images/individual_characters/Elf_M_Idle_4.png",
            "images/individual_characters/Elf_M_Walk_1.png",
            "images/individual_characters/Elf_M_Walk_2.png",
            "images/individual_characters/Elf_M_Walk_3.png",
            "images/individual_characters/Elf_M_Walk_4.png",
            "images/individual_characters/EliteKnight_Idle_1.png",
            "images/individual_characters/EliteKnight_Idle_2.png",
            "images/individual_characters/EliteKnight_Idle_3.png",
            "images/individual_characters/EliteKnight_Idle_4.png",
            "images/individual_characters/EliteKnight_Walk_1.png",
            "images/individual_characters/EliteKnight_Walk_2.png",
            "images/individual_characters/EliteKnight_Walk_3.png",
            "images/individual_characters/EliteKnight_Walk_4.png",
            "images/individual_characters/ElvenKnight_Idle_1.png",
            "images/individual_characters/ElvenKnight_Idle_2.png",
            "images/individual_characters/ElvenKnight_Idle_3.png",
            "images/individual_characters/ElvenKnight_Idle_4.png",
            "images/individual_characters/ElvenKnight_Walk_1.png",
            "images/individual_characters/ElvenKnight_Walk_2.png",
            "images/individual_characters/ElvenKnight_Walk_3.png",
            "images/individual_characters/ElvenKnight_Walk_4.png",
            "images/individual_characters/Ent_Idle_1.png",
            "images/individual_characters/Ent_Idle_2.png",
            "images/individual_characters/Ent_Idle_3.png",
            "images/individual_characters/Ent_Idle_4.png",
            "images/individual_characters/Ent_Walk_1.png",
            "images/individual_characters/Ent_Walk_2.png",
            "images/individual_characters/Ent_Walk_3.png",
            "images/individual_characters/Ent_Walk_4.png",
            "images/individual_characters/Executioner_Idle_1.png",
            "images/individual_characters/Executioner_Idle_2.png",
            "images/individual_characters/Executioner_Idle_3.png",
            "images/individual_characters/Executioner_Idle_4.png",
            "images/individual_characters/Executioner_Walk_1.png",
            "images/individual_characters/Executioner_Walk_2.png",
            "images/individual_characters/Executioner_Walk_3.png",
            "images/individual_characters/Executioner_Walk_4.png",
            // "images/individual_characters/Fairy_Idle + Walk_1.png",
            // "images/individual_characters/Fairy_Idle + Walk_2.png",
            // "images/individual_characters/Fairy_Idle + Walk_3.png",
            // "images/individual_characters/Fairy_Idle + Walk_4.png",
            // "images/individual_characters/FatCleric_Idle + Walk_1.png",
            // "images/individual_characters/FatCleric_Idle + Walk_2.png",
            // "images/individual_characters/FatCleric_Idle + Walk_3.png",
            // "images/individual_characters/FatCleric_Idle + Walk_4.png",
            // "images/individual_characters/FatNun_Idle + Walk_1.png",
            // "images/individual_characters/FatNun_Idle + Walk_2.png",
            // "images/individual_characters/FatNun_Idle + Walk_3.png",
            // "images/individual_characters/FatNun_Idle + Walk_4.png",
            "images/individual_characters/ForestGuardian_Idle_1.png",
            "images/individual_characters/ForestGuardian_Idle_2.png",
            "images/individual_characters/ForestGuardian_Idle_3.png",
            "images/individual_characters/ForestGuardian_Idle_4.png",
            "images/individual_characters/ForestGuardian_walk_1.png",
            "images/individual_characters/ForestGuardian_walk_2.png",
            "images/individual_characters/ForestGuardian_walk_3.png",
            "images/individual_characters/ForestGuardian_walk_4.png",
            "images/individual_characters/GnollBrute_Idle_1.png",
            "images/individual_characters/GnollBrute_Idle_2.png",
            "images/individual_characters/GnollBrute_Idle_3.png",
            "images/individual_characters/GnollBrute_Idle_4.png",
            "images/individual_characters/GnollBrute_Walk_1.png",
            "images/individual_characters/GnollBrute_Walk_2.png",
            "images/individual_characters/GnollBrute_Walk_3.png",
            "images/individual_characters/GnollBrute_Walk_4.png",
            "images/individual_characters/GnollOverseer_Idle_1.png",
            "images/individual_characters/GnollOverseer_Idle_2.png",
            "images/individual_characters/GnollOverseer_Idle_3.png",
            "images/individual_characters/GnollOverseer_Idle_4.png",
            "images/individual_characters/GnollOverseer_Walk_1.png",
            "images/individual_characters/GnollOverseer_Walk_2.png",
            "images/individual_characters/GnollOverseer_Walk_3.png",
            "images/individual_characters/GnollOverseer_Walk_4.png",
            "images/individual_characters/GnollScout_Idle_1.png",
            "images/individual_characters/GnollScout_Idle_2.png",
            "images/individual_characters/GnollScout_Idle_3.png",
            "images/individual_characters/GnollScout_Idle_4.png",
            "images/individual_characters/GnollScout_Walk_1.png",
            "images/individual_characters/GnollScout_Walk_2.png",
            "images/individual_characters/GnollScout_Walk_3.png",
            "images/individual_characters/GnollScout_Walk_4.png",
            "images/individual_characters/GnollShaman_Idle_1.png",
            "images/individual_characters/GnollShaman_Idle_2.png",
            "images/individual_characters/GnollShaman_Idle_3.png",
            "images/individual_characters/GnollShaman_Idle_4.png",
            "images/individual_characters/GnollShaman_Walk_1.png",
            "images/individual_characters/GnollShaman_Walk_2.png",
            "images/individual_characters/GnollShaman_Walk_3.png",
            "images/individual_characters/GnollShaman_Walk_4.png",
            "images/individual_characters/Golem_Idle_1.png",
            "images/individual_characters/Golem_Idle_2.png",
            "images/individual_characters/Golem_Idle_3.png",
            "images/individual_characters/Golem_Idle_4.png",
            "images/individual_characters/Golem_Idle_5.png",
            "images/individual_characters/Golem_Idle_6.png",
            "images/individual_characters/Golem_Walk_1.png",
            "images/individual_characters/Golem_Walk_2.png",
            "images/individual_characters/Golem_Walk_3.png",
            "images/individual_characters/Golem_Walk_4.png",
            "images/individual_characters/Golem_Walk_5.png",
            "images/individual_characters/Golem_Walk_6.png",
            "images/individual_characters/HeavyKnight_Idle_1.png",
            "images/individual_characters/HeavyKnight_Idle_2.png",
            "images/individual_characters/HeavyKnight_Idle_3.png",
            "images/individual_characters/HeavyKnight_Idle_4.png",
            "images/individual_characters/HeavyKnight_Walk_1.png",
            "images/individual_characters/HeavyKnight_Walk_2.png",
            "images/individual_characters/HeavyKnight_Walk_3.png",
            "images/individual_characters/HeavyKnight_Walk_4.png",
            "images/individual_characters/Herald_Idle_1.png",
            "images/individual_characters/Herald_Idle_2.png",
            "images/individual_characters/Herald_Idle_3.png",
            "images/individual_characters/Herald_Idle_4.png",
            "images/individual_characters/Herald_Walk_1.png",
            "images/individual_characters/Herald_Walk_2.png",
            "images/individual_characters/Herald_Walk_3.png",
            "images/individual_characters/Herald_Walk_4.png",
            "images/individual_characters/HighElf_F_Idle_1.png",
            "images/individual_characters/HighElf_F_Idle_2.png",
            "images/individual_characters/HighElf_F_Idle_3.png",
            "images/individual_characters/HighElf_F_Idle_4.png",
            "images/individual_characters/HighElf_F_Walk_1.png",
            "images/individual_characters/HighElf_F_Walk_2.png",
            "images/individual_characters/HighElf_F_Walk_3.png",
            "images/individual_characters/HighElf_F_Walk_4.png",
            // "images/individual_characters/HighElf_M_Idle + Walk_1.png",
            // "images/individual_characters/HighElf_M_Idle + Walk_2.png",
            // "images/individual_characters/HighElf_M_Idle + Walk_3.png",
            // "images/individual_characters/HighElf_M_Idle + Walk_4.png",
            "images/individual_characters/King_Idle_1.png",
            "images/individual_characters/King_Idle_2.png",
            "images/individual_characters/King_Idle_3.png",
            "images/individual_characters/King_Idle_4.png",
            "images/individual_characters/King_Walk_1.png",
            "images/individual_characters/King_Walk_2.png",
            "images/individual_characters/King_Walk_3.png",
            "images/individual_characters/King_Walk_4.png",
            "images/individual_characters/Knight_Idle_1.png",
            "images/individual_characters/Knight_Idle_2.png",
            "images/individual_characters/Knight_Idle_3.png",
            "images/individual_characters/Knight_Idle_4.png",
            "images/individual_characters/Knight_Walk_1.png",
            "images/individual_characters/Knight_Walk_2.png",
            "images/individual_characters/Knight_Walk_3.png",
            "images/individual_characters/Knight_Walk_4.png",
            "images/individual_characters/LargeEliteKnight_Idle_1.png",
            "images/individual_characters/LargeEliteKnight_Idle_2.png",
            "images/individual_characters/LargeEliteKnight_Idle_3.png",
            "images/individual_characters/LargeEliteKnight_Idle_4.png",
            "images/individual_characters/LargeEliteKnight_Walk_1.png",
            "images/individual_characters/LargeEliteKnight_Walk_2.png",
            "images/individual_characters/LargeEliteKnight_Walk_3.png",
            "images/individual_characters/LargeEliteKnight_Walk_4.png",
            "images/individual_characters/LargeKnight_Idle_1.png",
            "images/individual_characters/LargeKnight_Idle_2.png",
            "images/individual_characters/LargeKnight_Idle_3.png",
            "images/individual_characters/LargeKnight_Idle_4.png",
            "images/individual_characters/LargeKnight_Walk_1.png",
            "images/individual_characters/LargeKnight_Walk_2.png",
            "images/individual_characters/LargeKnight_Walk_3.png",
            "images/individual_characters/LargeKnight_Walk_4.png",
            "images/individual_characters/LargeMushroom_Idle_1.png",
            "images/individual_characters/LargeMushroom_Idle_2.png",
            "images/individual_characters/LargeMushroom_Idle_3.png",
            "images/individual_characters/LargeMushroom_Idle_4.png",
            "images/individual_characters/LargeMushroom_Walk_1.png",
            "images/individual_characters/LargeMushroom_Walk_2.png",
            "images/individual_characters/LargeMushroom_Walk_3.png",
            "images/individual_characters/LargeMushroom_Walk_4.png",
            "images/individual_characters/Mage_Idle_1.png",
            "images/individual_characters/Mage_Idle_2.png",
            "images/individual_characters/Mage_Idle_3.png",
            "images/individual_characters/Mage_Idle_4.png",
            "images/individual_characters/Mage_Walk_1.png",
            "images/individual_characters/Mage_Walk_2.png",
            "images/individual_characters/Mage_Walk_3.png",
            "images/individual_characters/Mage_Walk_4.png",
            // "images/individual_characters/MagicShopKeeper_Idle + Walk_1.png",
            // "images/individual_characters/MagicShopKeeper_Idle + Walk_2.png",
            // "images/individual_characters/MagicShopKeeper_Idle + Walk_3.png",
            // "images/individual_characters/MagicShopKeeper_Idle + Walk_4.png",
            "images/individual_characters/Merchant_Idle_1.png",
            "images/individual_characters/Merchant_Idle_2.png",
            "images/individual_characters/Merchant_Idle_3.png",
            "images/individual_characters/Merchant_Idle_4.png",
            "images/individual_characters/Merchant_Walk_1.png",
            "images/individual_characters/Merchant_Walk_2.png",
            "images/individual_characters/Merchant_Walk_3.png",
            "images/individual_characters/Merchant_Walk_4.png",
            // "images/individual_characters/MountainKing_Idle + Walk_1.png",
            // "images/individual_characters/MountainKing_Idle + Walk_2.png",
            // "images/individual_characters/MountainKing_Idle + Walk_3.png",
            // "images/individual_characters/MountainKing_Idle + Walk_4.png",
            // "images/individual_characters/NormalCleric_Idle + Walk_1.png",
            // "images/individual_characters/NormalCleric_Idle + Walk_2.png",
            // "images/individual_characters/NormalCleric_Idle + Walk_3.png",
            // "images/individual_characters/NormalCleric_Idle + Walk_4.png",
            "images/individual_characters/NormalMushroom_Idle_1.png",
            "images/individual_characters/NormalMushroom_Idle_2.png",
            "images/individual_characters/NormalMushroom_Idle_3.png",
            "images/individual_characters/NormalMushroom_Idle_4.png",
            "images/individual_characters/NormalMushroom_Walk_1.png",
            "images/individual_characters/NormalMushroom_Walk_2.png",
            "images/individual_characters/NormalMushroom_Walk_3.png",
            "images/individual_characters/NormalMushroom_Walk_4.png",
            // "images/individual_characters/NormalNun_Idle + Walk_1.png",
            // "images/individual_characters/NormalNun_Idle + Walk_2.png",
            // "images/individual_characters/NormalNun_Idle + Walk_3.png",
            // "images/individual_characters/NormalNun_Idle + Walk_4.png",
            "images/individual_characters/Princess_Idle_1.png",
            "images/individual_characters/Princess_Idle_2.png",
            "images/individual_characters/Princess_Idle_3.png",
            "images/individual_characters/Princess_Idle_4.png",
            "images/individual_characters/Princess_Walk_1.png",
            "images/individual_characters/Princess_Walk_2.png",
            "images/individual_characters/Princess_Walk_3.png",
            "images/individual_characters/Princess_Walk_4.png",
            "images/individual_characters/Queen_Idle_1.png",
            "images/individual_characters/Queen_Idle_2.png",
            "images/individual_characters/Queen_Idle_3.png",
            "images/individual_characters/Queen_Idle_4.png",
            "images/individual_characters/Queen_Walk_1.png",
            "images/individual_characters/Queen_Walk_2.png",
            "images/individual_characters/Queen_Walk_3.png",
            "images/individual_characters/Queen_Walk_4.png",
            "images/individual_characters/Ranger_Idle_1.png",
            "images/individual_characters/Ranger_Idle_2.png",
            "images/individual_characters/Ranger_Idle_3.png",
            "images/individual_characters/Ranger_Idle_4.png",
            "images/individual_characters/Ranger_Walk_1.png",
            "images/individual_characters/Ranger_Walk_2.png",
            "images/individual_characters/Ranger_Walk_3.png",
            "images/individual_characters/Ranger_Walk_4.png",
            // "images/individual_characters/SkinnyNun_Idle + Walk_1.png",
            // "images/individual_characters/SkinnyNun_Idle + Walk_2.png",
            // "images/individual_characters/SkinnyNun_Idle + Walk_3.png",
            // "images/individual_characters/SkinnyNun_Idle + Walk_4.png",
            "images/individual_characters/SmallMushroom_Idle_1.png",
            "images/individual_characters/SmallMushroom_Idle_2.png",
            "images/individual_characters/SmallMushroom_Idle_3.png",
            "images/individual_characters/SmallMushroom_Idle_4.png",
            "images/individual_characters/SmallMushroom_Walk_1.png",
            "images/individual_characters/SmallMushroom_Walk_2.png",
            "images/individual_characters/SmallMushroom_Walk_3.png",
            "images/individual_characters/SmallMushroom_Walk_4.png",
            // "images/individual_characters/TallCleric_Idle + Walk_1.png",
            // "images/individual_characters/TallCleric_Idle + Walk_2.png",
            // "images/individual_characters/TallCleric_Idle + Walk_3.png",
            // "images/individual_characters/TallCleric_Idle + Walk_4.png",
            "images/individual_characters/Thief_Idle_1.png",
            "images/individual_characters/Thief_Idle_2.png",
            "images/individual_characters/Thief_Idle_3.png",
            "images/individual_characters/Thief_Idle_4.png",
            "images/individual_characters/Thief_Walk_1.png",
            "images/individual_characters/Thief_Walk_2.png",
            "images/individual_characters/Thief_Walk_3.png",
            "images/individual_characters/Thief_Walk_4.png",
            "images/individual_characters/Townsfolk_F_Idle_1.png",
            "images/individual_characters/Townsfolk_F_Idle_2.png",
            "images/individual_characters/Townsfolk_F_Idle_3.png",
            "images/individual_characters/Townsfolk_F_Idle_4.png",
            "images/individual_characters/Townsfolk_F_Walk_1.png",
            "images/individual_characters/Townsfolk_F_Walk_2.png",
            "images/individual_characters/Townsfolk_F_Walk_3.png",
            "images/individual_characters/Townsfolk_F_Walk_4.png",
            "images/individual_characters/Troll_Idle_1.png",
            "images/individual_characters/Troll_Idle_2.png",
            "images/individual_characters/Troll_Idle_3.png",
            "images/individual_characters/Troll_Idle_4.png",
            "images/individual_characters/Troll_Walk_1.png",
            "images/individual_characters/Troll_Walk_2.png",
            "images/individual_characters/Troll_Walk_3.png",
            "images/individual_characters/Troll_Walk_4.png",
            // "images/individual_characters/Wizard_Idle + Walk_1.png",
            // "images/individual_characters/Wizard_Idle + Walk_2.png",
            // "images/individual_characters/Wizard_Idle + Walk_3.png",
            // "images/individual_characters/Wizard_Idle + Walk_4.png",
            "images/individual_characters/Wolf_Idle_1.png",
            "images/individual_characters/Wolf_Idle_2.png",
            "images/individual_characters/Wolf_Idle_3.png",
            "images/individual_characters/Wolf_Idle_4.png",
            "images/individual_characters/Wolf_Walk_1.png",
            "images/individual_characters/Wolf_Walk_2.png",
            "images/individual_characters/Wolf_Walk_3.png",
            "images/individual_characters/Wolf_Walk_4.png",
        ]
    }
}