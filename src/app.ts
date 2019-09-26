import { Tile, TileType } from "./tile"
import { Renderer } from "./renderer";
import { Point } from "./util";

let currentSessionTicks = 0

function tick() {
    const RENDERER = new Renderer()
    RENDERER.render([
        new Tile(TileType.GRASS_1, new Point(1, 2)),
        new Tile(TileType.BLANK, new Point(1, 3)),
        new Tile(TileType.GROUND_1, new Point(1, 4)),
        new Tile(TileType.GROUND_3, new Point(1, 6))
    ])
    currentSessionTicks
}

setInterval(tick, 1/60);
