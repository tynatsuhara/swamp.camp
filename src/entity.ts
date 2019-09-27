import { Point } from "./util";
import { CapturedInput, InputKey } from "./input";

export class Tile {
    static BLANK = new Point(0, 0)
    static GROUND_1 = new Point(1, 0)
    static GROUND_2 = new Point(2, 0)
    static GROUND_3 = new Point(3, 0)
    static GROUND_4 = new Point(4, 0)
    static GRASS_1 = new Point(5, 0)
    static GRASS_2 = new Point(6, 0)
    static GRASS_3 = new Point(7, 0)
}

export class Entity {
    readonly tileSetIndex: Point
    position: Point

    constructor(tileSetIndex: Point, position: Point) {
        this.tileSetIndex = tileSetIndex
        this.position = position
    }

    update(input: CapturedInput) {}
}

export class Player extends Entity {
    update(input: CapturedInput) {
        if (input.isKeyDown(InputKey.D)) {
            this.position = new Point(this.position.x + 1, this.position.y)
            console.log(this.position)
        }
    }
}