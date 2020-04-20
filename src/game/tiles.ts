import { Point } from "../engine/point"
import { TileSet } from "../engine/tiles/TileSet"
import { TileSource } from "../engine/tiles/TileSource"

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
    static SWORD_1 = Tile.get(35, 0)
    static SWORD_2 = Tile.get(36, 0)

    // weapons
    static CLUB = Tile.get(0, 24)
    static SWORD = Tile.get(0, 29)

    // animations
    static SLASH = Tile.get(24, 11)
    static ARC = Tile.get(25, 11)
    static TRIPLE_SLASH = Tile.get(26, 11)
    static BUBBLES = Tile.get(27, 11)

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

    static CHARACTER_MAP = {
        '0': Tile.get(19, 29),
        '1': Tile.get(20, 29),
        '2': Tile.get(21, 29),
        '3': Tile.get(22, 29),
        '4': Tile.get(23, 29),
        '5': Tile.get(24, 29),
        '6': Tile.get(25, 29),
        '7': Tile.get(26, 29),
        '8': Tile.get(27, 29),
        '9': Tile.get(28, 29),
        ':': Tile.get(29, 29),
        '.': Tile.get(30, 29),
        '%': Tile.get(31, 29),
        '!': Tile.get(19, 25),
        '?': Tile.get(21, 25),
        '$': Tile.get(19, 28),
        ' ': Tile.get(0, 0),
        'a': Tile.get(19, 30),
        'b': Tile.get(20, 30),
        'c': Tile.get(21, 30),
        'd': Tile.get(22, 30),
        'e': Tile.get(23, 30),
        'f': Tile.get(24, 30),
        'g': Tile.get(25, 30),
        'h': Tile.get(26, 30),
        'i': Tile.get(27, 30),
        'j': Tile.get(28, 30),
        'k': Tile.get(29, 30),
        'l': Tile.get(30, 30),
        'm': Tile.get(31, 30),
        'n': Tile.get(19, 31),
        'o': Tile.get(20, 31),
        'p': Tile.get(21, 31),
        'q': Tile.get(22, 31),
        'r': Tile.get(23, 31),
        's': Tile.get(24, 31),
        't': Tile.get(25, 31),
        'u': Tile.get(26, 31),
        'v': Tile.get(27, 31),
        'w': Tile.get(28, 31),
        'x': Tile.get(29, 31),
        'y': Tile.get(30, 31),
        'z': Tile.get(31, 31)
    }

    static string(s: string) {
        return Array.from(s).map(c => Tile.CHARACTER_MAP[c])
    }

    private static get(x: number, y: number) {
        return new TileSource(TILE_SET, new Point(x, y))
    }
}
