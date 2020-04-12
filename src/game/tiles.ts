import { Point } from "../engine/point"
import { TileSet, TileSource } from "../engine/tileset"

export const TILE_SIZE = 16
const TILE_SET = new TileSet(
    <HTMLImageElement>document.getElementById("tileset"),
    TILE_SIZE,
    1
)

export class Tile {
    // environment
    static GROUND_1 = Tile.get(1, 0)
    static GROUND_2 = Tile.get(2, 0)
    static GROUND_3 = Tile.get(3, 0)
    static GROUND_4 = Tile.get(4, 0)
    static GRASS_1 = Tile.get(5, 0)
    static GRASS_2 = Tile.get(6, 0)
    static GRASS_3 = Tile.get(7, 0)
    static TREE_1 = Tile.get(0, 1)
    static TREE_2 = Tile.get(1, 1)
    static TREE_3 = Tile.get(2, 1)
    static TREE_4 = Tile.get(3, 1)
    static TREE_5 = Tile.get(4, 1)
    static TREE_6 = Tile.get(5, 1)
    static CACTUS = Tile.get(6, 1)
    static CACTI = Tile.get(7, 1)
    static TALL_GRASS = Tile.get(0, 2)
    static VINES_TOP = Tile.get(1, 2)
    static VINES_BOTTOM = Tile.get(2, 2)
    static TREES = Tile.get(3, 2)
    static ROUND_TREE = Tile.get(4, 2)
    static ROCKS = Tile.get(5, 2)
    static DEAD_TREE = Tile.get(6, 2)
    static PALM_TREE = Tile.get(7, 2)
    static DOOR_1 = Tile.get(9, 3)
    static DOOR_2 = Tile.get(9, 4)
    static DOOR_3 = Tile.get(9, 5)
    static DOOR_OPEN = Tile.get(9, 6)

    // characters
    static GUY_1 = Tile.get(24, 0)

    // weapons
    static CLUB = Tile.get(0, 24)
    static SWORD = Tile.get(0, 29)

    // animations
    static SLASH = Tile.get(16, 19)
    static ARC = Tile.get(17, 19)
    static TRIPLE_SLASH = Tile.get(18, 19)
    static BUBBLES = Tile.get(19, 19)

    // items
    static COIN = Tile.get(22, 4)
    static DIAMOND = Tile.get(23, 4)

    // ui
    static BORDER_1 = Tile.get(0, 16)
    static BORDER_2 = Tile.get(1, 16)
    static BORDER_3 = Tile.get(2, 16)
    static BORDER_4 = Tile.get(2, 17)
    static BORDER_5 = Tile.get(2, 18)
    static BORDER_6 = Tile.get(1, 18)
    static BORDER_7 = Tile.get(0, 18)
    static BORDER_8 = Tile.get(0, 17)
    static DPAD_DEFAULT = Tile.get(27, 22)
    static DPAD_UP = Tile.get(28, 22)
    static DPAD_RIGHT = Tile.get(29, 22)
    static DPAD_DOWN = Tile.get(30, 22)
    static DPAD_LEFT = Tile.get(31, 22)

    static NUM_0 = Tile.get(19, 29)
    static NUM_1 = Tile.get(20, 29)
    static NUM_2 = Tile.get(21, 29)
    static NUM_3 = Tile.get(22, 29)
    static NUM_4 = Tile.get(23, 29)
    static NUM_5 = Tile.get(24, 29)
    static NUM_6 = Tile.get(25, 29)
    static NUM_7 = Tile.get(26, 29)
    static NUM_8 = Tile.get(27, 29)
    static NUM_9 = Tile.get(28, 29)

    private static get(x: number, y: number) {
        return new TileSource(TILE_SET, new Point(x, y))
    }
}
