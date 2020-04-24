import { Entity } from "../engine/Entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { MapGenerator } from "./MapGenerator"
import { Tilesets, TILE_SIZE } from "./graphics/Tilesets"
import { DudeFactory } from "./characters/DudeFactory"
import { DynamicEntityManager } from "./DynamicEntityManager"
import { HUD } from "./ui/HUD"
import { TileEntityManager } from "./TileEntityManager"


const ZOOM = 3.125

export class QuestGame extends Game {

    readonly tilesets = new Tilesets()

    readonly dynamicEntityManager = new DynamicEntityManager()
    readonly tileEntityManager = new TileEntityManager()

    readonly dudeFactory = new DudeFactory()
    readonly player = this.dudeFactory.newPlayer(new Point(-2, 2).times(TILE_SIZE))
    readonly hud = new HUD()
    
    private gameEntityView: View = new View()
    private uiView: View = new View()

    initialize() {
        this.dudeFactory.newElf(new Point(20, 30))
        this.dudeFactory.newImp(new Point(80, 30))

        // this.enemies.push(new Entity([new Dude("goblin", new Point(80, 30)), new NPC()]))

        // const rockPt = new Point(5, 5)
        // this.tiles.set(rockPt, new Entity([
        //     new TileComponent(Tile.ROCKS, rockPt.times(TILE_SIZE)),
        //     new Clickable(rockPt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE), () => console.log("clicked a fuckin' rock!")),
        //     new Interactable(() => console.log("interacted with a fuckin' rock!")),
        //     new BoxCollider(rockPt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE))
        // ]))

        const mapGen = new MapGenerator()
        mapGen.doIt()
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
            entities: this.tileEntityManager.entries().concat(this.dynamicEntityManager.getEntities())
        }

        this.uiView = {
            zoom: ZOOM,
            offset: new Point(0, 0),
            entities: this.getUIEntities()
        }
    }

    // entities whose position is fixed on the camera
    getUIEntities(): Entity[] {
        return [this.hud.get(this.player)]

        /*
        const dimensions = new Point(20, 16)  // tile dimensions

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
        */
    }
}
