import { Point } from "./util";

export class TileType {
    static BLANK = new Point(0, 0)
    static GROUND_1 = new Point(1, 0)
    static GROUND_2 = new Point(2, 0)
    static GROUND_3 = new Point(3, 0)
    static GROUND_4 = new Point(4, 0)
    static GRASS_1 = new Point(5, 0)
    static GRASS_2 = new Point(6, 0)
    static GRASS_3 = new Point(7, 0)
}

export class Tile {
    readonly tileSetIndex: Point
    position: Point

    constructor(tileSetIndex: Point, position: Point) {
        this.tileSetIndex = tileSetIndex
        this.position = position
    }

    setPosition(position: Point) {
        this.position = position
    }
}