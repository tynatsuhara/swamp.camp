import { Entity } from "../engine/entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/view"
import { Tile, TILE_SIZE } from "./tiles"
import { Grid } from "../engine/grid"
import { TileEntity, AnimatedTileEntity, TileSetAnimation, TileSource } from "../engine/tileset"
import { Player } from "./player"

const ZOOM = 2.5

export class QuestGame extends Game {

    // todo: is there any reason to have this "grid"? is it redundant?
    private readonly grid: Grid<TileEntity> = new Grid()
    private readonly player: Player = new Player(Tile.GUY_1, new Point(2, 2).times(TILE_SIZE))
    
    private gameEntityView: View = new View()
    private uiView: View = new View()

    constructor() {
        super()

        this.addTileEntityToGrid(1, 1, Tile.GRASS_1)
        this.addTileEntityToGrid(2, 1, Tile.GRASS_3)
        this.addTileEntityToGrid(1, 2, Tile.GRASS_1)
        this.addTileEntityToGrid(1, 4, Tile.GRASS_1)
        this.addTileEntityToGrid(2, 3, Tile.ROCKS)
        this.addTileEntityToGrid(4, 4, Tile.SWORD)

        this.grid.set(new Point(5, 6), new AnimatedTileEntity(new TileSetAnimation([
            [Tile.NUM_0, 1000],
            [Tile.NUM_1, 1000],
            [Tile.NUM_2, 1000],
            [Tile.NUM_3, 1000],
            [Tile.NUM_4, 1000],
            [Tile.NUM_5, 1000],
            [Tile.NUM_6, 1000],
            [Tile.NUM_7, 1000],
            [Tile.NUM_8, 1000],
            [Tile.NUM_9, 1000]
        ])))
    }

    addTileEntityToGrid(x: number, y: number, source: TileSource) {
        const pt = new Point(x, y)
        this.grid.set(pt, new TileEntity(source, pt.times(TILE_SIZE)))
    }

    // entities in the world space
    getViews(updateViewsContext: UpdateViewsContext): View[] {
        this.updateViews(updateViewsContext)
        return [this.gameEntityView, this.uiView]
    }

    updateViews(updateViewsContext: UpdateViewsContext) {
        // TODO: figure out how to abstract zoom from entities
        const cameraGoal = updateViewsContext.dimensions.div(ZOOM).div(2).minus(this.player.position)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: this.gameEntityView.offset.lerp(.03 / updateViewsContext.elapsedTimeMillis, cameraGoal),
            entities: this.grid.entries().concat([this.player])
        }

        this.uiView = {
            zoom: ZOOM,
            offset: new Point(0, 0),
            entities: this.getUIEntities()
        }
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