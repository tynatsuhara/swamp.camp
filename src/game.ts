import { Entity, Player, Tile } from "./entity";
import { Point } from "./util";

export class Game {

    readonly tiles = [
        new Player(Tile.GROUND_4, new Point(0, 0)),
        new Entity(Tile.GRASS_1, new Point(1, 2)),
        new Entity(Tile.GRASS_3, new Point(1, 3)),
        new Entity(Tile.GROUND_1, new Point(1, 4)),
        new Entity(Tile.GROUND_3, new Point(1, 6))
    ]

    getEntities(): Entity[] {
        return this.tiles
    }
}