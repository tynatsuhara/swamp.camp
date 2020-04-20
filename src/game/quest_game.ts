import { Entity } from "../engine/Entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { Tile, TILE_SIZE } from "./tiles"
import { Grid } from "../engine/util/Grid"
import { AnimatedTileComponent } from "../engine/tiles/AnimatedTileComponent"
import { TileSetAnimation } from "../engine/tiles/TileSetAnimation"
import { TileComponent } from "../engine/tiles/TileComponent"
import { TileSource } from "../engine/tiles/TileSource"
import { Player } from "./player"
import { BoxCollider } from "../engine/collision"
import { TileGrid } from "../engine/tiles/TileGrid"

const ZOOM = 2.5

export class QuestGame extends Game {

    private readonly tiles = new TileGrid(TILE_SIZE)
    private readonly player = new Entity([new Player(new Point(-2, 2).times(TILE_SIZE))]).getComponent(Player)
    
    private gameEntityView: View = new View()
    private uiView: View = {
        zoom: ZOOM,
        offset: new Point(0, 0),
        entities: this.getUIEntities()
    }

    constructor() {
        super()

        this.renderPath(new Point(-10, -10), new Point(10, 10), 5)
        this.renderPath(new Point(10, -10), new Point(-10, 10), 15)

        // this.renderPath(new Point(0, -10), new Point(0, 10), 15)
        // this.renderPath(new Point(10, 0), new Point(-10, 0), 15)
    }

    renderPath(start: Point, end: Point, randomness) {
        this.tiles.renderPath(start, end, Tile.PATH, randomness)
    }

    // entities in the world space
    getViews(updateViewsContext: UpdateViewsContext): View[] {
        this.updateViews(updateViewsContext)
        return [
            this.gameEntityView, 
            this.uiView
        ]
    }

    updateViews(updateViewsContext: UpdateViewsContext) {
        // TODO: figure out how to abstract zoom from entities
        const cameraGoal = updateViewsContext.dimensions.div(ZOOM).div(2).minus(this.player.position)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: this.gameEntityView.offset.lerp(.0018 * updateViewsContext.elapsedTimeMillis, cameraGoal),
            entities: this.tiles.entities().concat([this.player.entity])
        }
    }

    // entities whose position is fixed on the camera
    getUIEntities(): Entity[] {
        const dimensions = new Point(25, 20)  // tile dimensions

        const result: TileComponent[] = []
        result.push(new TileComponent(Tile.BORDER_1, new Point(0, 0)))
        result.push(new TileComponent(Tile.BORDER_3, new Point(dimensions.x - 1, 0).times(TILE_SIZE)))
        result.push(new TileComponent(Tile.BORDER_5, new Point(dimensions.x - 1, dimensions.y - 1).times(TILE_SIZE)))
        result.push(new TileComponent(Tile.BORDER_7, new Point(0, dimensions.y - 1).times(TILE_SIZE)))

        // horizontal lines
        for (let i = 1; i < dimensions.x - 1; i++) {
            result.push(new TileComponent(Tile.BORDER_2, new Point(i, 0).times(TILE_SIZE)))            
            result.push(new TileComponent(Tile.BORDER_6, new Point(i, dimensions.y - 1).times(TILE_SIZE)))            
        }

        // vertical lines
        for (let j = 1; j < dimensions.y - 1; j++) {
            result.push(new TileComponent(Tile.BORDER_4, new Point(dimensions.x - 1, j).times(TILE_SIZE)))
            result.push(new TileComponent(Tile.BORDER_8, new Point(0, j).times(TILE_SIZE)))            
        }

        return [new Entity(result)]
    }
}