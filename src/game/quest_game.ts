import { Entity } from "../engine/entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateData } from "../engine/engine"
import { View } from "../engine/view";
import { TileEntity, Player, Tile, TILE_SIZE } from "./tiles";

const TILE_SET = <HTMLImageElement>document.getElementById("tileset")

export class QuestGame extends Game {
    
    readonly worldEntities = [
        new TileEntity(Tile.GRASS_1, new Point(1, 1).times(TILE_SIZE)),
        new Player(Tile.GUY_1, new Point(2, 2).times(TILE_SIZE))
    ]

    // entities in the world space
    getViews(updateData: UpdateData): View[] {
        const gameEntityView: View = {
            zoom: 2.5,
            offset: new Point(0, 0),
            entities: this.worldEntities
        }

        const uiView: View = {
            zoom: 2.5,
            offset: new Point(0, 0),
            entities: this.getUIEntities()
        }

        return [gameEntityView, uiView]
    }

    // entities whose position is fixed on the camera
    getUIEntities(): Entity[] {
        const dimensions = new Point(25, 20)  // tile dimensions

        const result = []
        result.push(new TileEntity(Tile.BORDER_1, new Point(0, 0)))
        result.push(new TileEntity(Tile.BORDER_3, new Point(dimensions.x - 1, 0).times(TILE_SIZE)))
        result.push(new TileEntity(Tile.BORDER_5, new Point(dimensions.x - 1, dimensions.y - 1).times(TILE_SIZE)))
        result.push(new TileEntity(Tile.BORDER_7, new Point(0, dimensions.y - 1).times(TILE_SIZE)))

        // horizontal lines
        for (let i = 1; i < dimensions.x - 1; i++) {
            result.push(new TileEntity(Tile.BORDER_2, new Point(i, 0).times(TILE_SIZE)))            
            result.push(new TileEntity(Tile.BORDER_6, new Point(i, dimensions.y - 1).times(TILE_SIZE)))            
        }

        // vertical lines
        for (let j = 1; j < dimensions.y - 1; j++) {
            result.push(new TileEntity(Tile.BORDER_4, new Point(dimensions.x - 1, j).times(TILE_SIZE)))
            result.push(new TileEntity(Tile.BORDER_8, new Point(0, j).times(TILE_SIZE)))            
        }

        return result
    }
}