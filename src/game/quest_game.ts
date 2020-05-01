import { Entity } from "../engine/Entity"
import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { MapGenerator } from "./world/MapGenerator"
import { Tilesets, TILE_SIZE } from "./graphics/Tilesets"
import { DudeFactory } from "./characters/DudeFactory"
import { HUD } from "./ui/HUD"
import { LocationManager } from "./world/LocationManager"
import { Dude } from "./characters/Dude"
import { CollisionEngine } from "../engine/collision/CollisionEngine"
import { DroppedItem } from "./items/DroppedItem"
import { UIStateManager } from "./ui/UIStateManager"
import { serialize } from "./saves/SerializeObject"
import { Save, StoryState } from "./saves/SaveGame"
import { Elements } from "./world/elements/Elements"
import { Ground } from "./world/ground/Ground"


const ZOOM = 3

export class QuestGame extends Game {

    private locationManager = new LocationManager()
    private player: Dude

    readonly tilesets = new Tilesets()
    readonly dudeFactory = new DudeFactory()
    readonly uiStateManager = new UIStateManager()
    
    private gameEntityView: View = new View()
    private uiView: View = new View()

    initialize() {
        CollisionEngine.instance.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.COLLISION_LAYER]],
            [Dude.COLLISION_LAYER, [Dude.COLLISION_LAYER]],
        ]))

        // Initialize singletons
        new Elements()
        new Ground()

        // World must be initialized before we do anything else
        new MapGenerator().doIt()

        this.player = this.dudeFactory.newPlayer(new Point(-2, 2).times(TILE_SIZE))

        // TEST: Spawn some guys
        this.dudeFactory.newElf(new Point(20, 30))
        this.dudeFactory.newImp(new Point(80, 30))



        setTimeout(() => this.save(), 1000)
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
            entities: this.locationManager.currentLocation.getEntities()
        }

        this.uiView = {
            zoom: ZOOM,
            offset: new Point(0, 0),
            entities: this.uiStateManager.get(updateViewsContext)
        }
    }

    save() {
        const save: Save = {
            // storyState: StoryState.INTRODUCTION,
            locations: this.locationManager.save()
        } 
        console.log(JSON.stringify(save, null, "  "))
    }

    load(save: Save) {
        this.locationManager = LocationManager.load(save.locations)
    }
}
