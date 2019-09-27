import { Entity, Player, Tile } from "./entity";
import { Point } from "./util";
import { UpdateData } from "./app";
import { TILE_SIZE } from "./renderer";

export class Game {

    readonly worldEntities = [
        new Entity(Tile.GRASS_1, new Point(1, 1).times(TILE_SIZE)),

        new Player(Tile.GUY_1, new Point(0, 0))
    ]

    // entities in the world space
    getWorldEntities(): Entity[] {
        return this.worldEntities
    }

    // entities whose position is fixed on the camera
    getUIEntities(updateData: UpdateData): Entity[] {
        const result = []
        result.push(new Entity(Tile.BORDER_1, new Point(0, 0)))
        result.push(new Entity(Tile.BORDER_3, new Point(updateData.dimensions.x - 1, 0).times(TILE_SIZE)))
        result.push(new Entity(Tile.BORDER_5, new Point(updateData.dimensions.x - 1, updateData.dimensions.y - 1).times(TILE_SIZE)))
        result.push(new Entity(Tile.BORDER_7, new Point(0, updateData.dimensions.y - 1).times(TILE_SIZE)))

        // horizontal lines
        for (let i = 1; i < updateData.dimensions.x - 1; i++) {
            result.push(new Entity(Tile.BORDER_2, new Point(i, 0).times(TILE_SIZE)))            
            result.push(new Entity(Tile.BORDER_6, new Point(i, updateData.dimensions.y - 1).times(TILE_SIZE)))            
        }

        // vertical lines
        for (let j = 1; j < updateData.dimensions.y - 1; j++) {
            result.push(new Entity(Tile.BORDER_4, new Point(updateData.dimensions.x - 1, j).times(TILE_SIZE)))
            result.push(new Entity(Tile.BORDER_8, new Point(0, j).times(TILE_SIZE)))            
        }

        return result
    }
}