import { Entity } from "../engine/entity";
import { Point } from "../engine/point";
import { UpdateData } from "../engine/engine";
import { InputKey } from "../engine/input";
import { RenderImage } from "../engine/renderer";

const TILE_SET = <HTMLImageElement>document.getElementById("tileset")
export const TILE_SIZE = 16

export class Tile {
    static BLANK = new Point(0, 0)
    static GROUND_1 = new Point(1, 0)
    static GROUND_2 = new Point(2, 0)
    static GROUND_3 = new Point(3, 0)
    static GROUND_4 = new Point(4, 0)
    static GRASS_1 = new Point(5, 0)
    static GRASS_2 = new Point(6, 0)
    static GRASS_3 = new Point(7, 0)

    static GUY_1 = new Point(24, 0)

    static BORDER_1 = new Point(0, 16)
    static BORDER_2 = new Point(1, 16)
    static BORDER_3 = new Point(2, 16)
    static BORDER_4 = new Point(2, 17)
    static BORDER_5 = new Point(2, 18)
    static BORDER_6 = new Point(1, 18)
    static BORDER_7 = new Point(0, 18)
    static BORDER_8 = new Point(0, 17)
}

export class TileEntity extends Entity {
    private readonly tileSetIndex: Point

    constructor(tileSetIndex: Point, position: Point) {
        super(position)
        this.tileSetIndex = tileSetIndex
    }

    getRenderImage(): RenderImage {
        return {
            source: TILE_SET,
            position: new Point(this.tileSetIndex.x, this.tileSetIndex.y).times(TILE_SIZE + 1),
            dimensions: new Point(TILE_SIZE, TILE_SIZE)
        }
    }
}

export class Player extends TileEntity {
    readonly speed = 1.2

    update(updateData: UpdateData) {
        let dx = 0
        let dy = 0

        if (updateData.input.isKeyHeld(InputKey.W)) { dy-- }
        if (updateData.input.isKeyHeld(InputKey.S)) { dy++ }
        if (updateData.input.isKeyHeld(InputKey.A)) { dx-- }
        if (updateData.input.isKeyHeld(InputKey.D)) { dx++ }
        
        this.position = new Point(
            this.position.x + dx / updateData.elapsedTimeMillis * this.speed, 
            this.position.y + dy / updateData.elapsedTimeMillis * this.speed
        )
    }
}