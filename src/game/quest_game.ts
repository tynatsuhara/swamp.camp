import { Entity } from "../engine/Entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { TileComponent } from "../engine/tiles/TileComponent"
import { Dude } from "./characters/Dude"
import { TileGrid } from "../engine/tiles/TileGrid"
import { MapGenerator } from "./MapGenerator"
import { AnimatedTileComponent } from "../engine/tiles/AnimatedTileComponent"
import { TileManager, TILE_SIZE } from "./graphics/TileManager"
import { Player } from "./characters/Player"
import { NPC } from "./characters/NPC"
import { DudeFactory } from "./characters/DudeFactory"


const ZOOM = 3.125

export class QuestGame extends Game {

    readonly tileManager = new TileManager()
    readonly tiles = new TileGrid(TILE_SIZE)
    readonly dudeFactory = new DudeFactory()
    readonly player = this.dudeFactory.newPlayer(new Point(-2, 2).times(TILE_SIZE))
    
    private gameEntityView: View = new View()
    private uiView: View = {
        zoom: ZOOM,
        offset: new Point(0, 0),
        entities: this.getUIEntities()
    }

    initialize() {
        this.dudeFactory.newElf(new Point(20, 30))

        // this.enemies.push(new Entity([new Dude("goblin", new Point(80, 30)), new NPC()]))

        // const rockPt = new Point(5, 5)
        // this.tiles.set(rockPt, new Entity([
        //     new TileComponent(Tile.ROCKS, rockPt.times(TILE_SIZE)),
        //     new Clickable(rockPt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE), () => console.log("clicked a fuckin' rock!")),
        //     new Interactable(() => console.log("interacted with a fuckin' rock!")),
        //     new BoxCollider(rockPt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE))
        // ]))

        const mapGen = new MapGenerator()

        mapGen.renderPath(this.tiles, new Point(-10, -10), new Point(10, 10), mapGen.pathSchema, 2)
        mapGen.renderPath(this.tiles, new Point(10, -10), new Point(-10, 10), mapGen.pathSchema, 5)


        for (let i = -20; i < 20; i++) {
            for (let j = -20; j < 20; j++) {
                const pt = new Point(i, j)
                if (!this.tiles.get(pt)) {
                    let tile
                    if (Math.random() < .65) {
                        tile = this.tileManager.tilemap.getTileAt(new Point(0, Math.floor(Math.random() * 4)))
                    } else {
                        tile = this.tileManager.tilemap.getTileAt(new Point(0, 7))
                    }
                    this.tiles.set(pt, new Entity([new TileComponent(tile, pt.times(TILE_SIZE))]))
                }
            }
        }
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
            entities: this.tiles.entries().concat(this.dudeFactory.getSpawnedEntities())
        }
    }

    // entities whose position is fixed on the camera
    getUIEntities(): Entity[] {

        const coin = new AnimatedTileComponent(new Point(4, 4), this.tileManager.dungeonCharacters.getTileSetAnimation("coin_anim", 150))


        const dimensions = new Point(20, 16)  // tile dimensions

        const result: TileComponent[] = []
        // result.push(new TileComponent(Tile.BORDER_1, new Point(0, 0)))
        // result.push(new TileComponent(Tile.BORDER_3, new Point(dimensions.x - 1, 0).times(TILE_SIZE)))
        // result.push(new TileComponent(Tile.BORDER_5, new Point(dimensions.x - 1, dimensions.y - 1).times(TILE_SIZE)))
        // result.push(new TileComponent(Tile.BORDER_7, new Point(0, dimensions.y - 1).times(TILE_SIZE)))

        // // horizontal lines
        // for (let i = 1; i < dimensions.x - 1; i++) {
        //     result.push(new TileComponent(Tile.BORDER_2, new Point(i, 0).times(TILE_SIZE)))            
        //     result.push(new TileComponent(Tile.BORDER_6, new Point(i, dimensions.y - 1).times(TILE_SIZE)))            
        // }

        // // vertical lines
        // for (let j = 1; j < dimensions.y - 1; j++) {
        //     result.push(new TileComponent(Tile.BORDER_4, new Point(dimensions.x - 1, j).times(TILE_SIZE)))
        //     result.push(new TileComponent(Tile.BORDER_8, new Point(0, j).times(TILE_SIZE)))            
        // }

        return [new Entity(result.concat([coin]))]
    }
}
