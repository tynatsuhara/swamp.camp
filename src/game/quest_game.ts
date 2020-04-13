import { Entity } from "../engine/entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/view"
import { Tile, TILE_SIZE } from "./tiles"
import { Grid } from "../engine/grid"
import { TileComponent, AnimatedTileComponent, TileSetAnimation, TileSource } from "../engine/tileset"
import { Player } from "./player"
import { Component } from "../engine/component"

const ZOOM = 2.5

export class QuestGame extends Game {

    // todo: is there any reason to have this "grid"? is it redundant?
    private readonly entities: Entity[] = []
    private readonly player: Player = new Entity([new Player(new Point(2, 2).times(TILE_SIZE))]).getComponent(Player)
    
    private gameEntityView: View = new View()
    private uiView: View = {
        zoom: ZOOM,
        offset: new Point(0, 0),
        entities: this.getUIEntities()
    }

    constructor() {
        super()

        this.addTileEntity(1, 1, Tile.GRASS_1)
        this.addTileEntity(2, 1, Tile.GRASS_3)
        this.addTileEntity(1, 2, Tile.GRASS_1)
        this.addTileEntity(1, 4, Tile.GRASS_1)
        this.addTileEntity(2, 3, Tile.ROCKS)
        this.addTileEntity(4, 4, Tile.SWORD)

        const flutteringGrass = new AnimatedTileComponent(
            new TileSetAnimation([
                [Tile.GRASS_1, 900],
                [Tile.GRASS_3, 750]
            ]),
            new Point(10, 10).times(TILE_SIZE)
        )
        this.entities.push(new Entity([flutteringGrass]))

        const tickerComponent = new AnimatedTileComponent(new TileSetAnimation(
            Tile.string('wowie!').map(tile => [tile, 300])
        ))
        this.entities.push(new Entity([tickerComponent]))
    }

    addTileEntity(x: number, y: number, source: TileSource) {
        this.entities.push(new Entity([new TileComponent(source, new Point(x, y).times(TILE_SIZE))]))
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
            entities: this.entities.concat([this.player.entity])
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