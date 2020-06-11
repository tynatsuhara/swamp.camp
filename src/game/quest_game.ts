import { Point } from "../engine/point"
import { Game } from "../engine/game"
import { UpdateViewsContext } from "../engine/engine"
import { View } from "../engine/View"
import { MapGenerator } from "./world/MapGenerator"
import { Tilesets, TILE_SIZE } from "./graphics/Tilesets"
import { DudeFactory, DudeType } from "./characters/DudeFactory"
import { LocationManager } from "./world/LocationManager"
import { Dude } from "./characters/Dude"
import { CollisionEngine } from "../engine/collision/CollisionEngine"
import { DroppedItem } from "./items/DroppedItem"
import { UIStateManager } from "./ui/UIStateManager"
import { Elements } from "./world/elements/Elements"
import { Ground } from "./world/ground/Ground"
import { InputKey } from "../engine/input"
import { CutsceneManager } from "./cutscenes/CutsceneManager"
import { IntroCutscene } from "./cutscenes/IntroCutscene"
import { Camera } from "./cutscenes/Camera"
import { SaveManager } from "./SaveManager"
import { PointLightMaskRenderer } from "./world/PointLightMaskRenderer"
import { WorldTime } from "./world/WorldTime"
import { EventQueue } from "./world/events/EventQueue"
import { Component } from "../engine/component"
import { TileComponent } from "../engine/tiles/TileComponent"
import { GroundRenderer } from "./world/GroundRenderer"


const ZOOM = 3

export class QuestGame extends Game {

    private gameEntityView: View
    private uiView: View

    initialize() {
        CollisionEngine.instance.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.COLLISION_LAYER]],
            [Dude.COLLISION_LAYER, [Dude.COLLISION_LAYER]],
        ]))

        // Initialize singletons
        new Tilesets()
        new UIStateManager()
        new SaveManager()
        new DudeFactory()
        new Elements()
        new Ground()
        new Camera()
        new CutsceneManager()
        new PointLightMaskRenderer()
        new GroundRenderer()

        if (!SaveManager.instance.load()) {
            this.newGame()
        }
    }

    newGame() {
        new LocationManager()
        new WorldTime(WorldTime.HOUR * 19.5)
        new EventQueue()
        
        // World must be initialized before we do anything else
        new MapGenerator().doIt()

        const playerStartPos = MapGenerator.ENTER_LAND_POS
        const playerDude = DudeFactory.instance.new(DudeType.PLAYER, playerStartPos)

        Camera.instance.focusOnDude(playerDude)

        DudeFactory.instance.new(DudeType.DIP, Point.ZERO)
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(3, 1).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-1, 3).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-4, 0).times(TILE_SIZE))

        // TODO clean up obstacles (trees, rocks, etc) so intro goes smoothly
        CutsceneManager.instance.startCutscene(new IntroCutscene())
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
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const cameraOffset = Camera.instance.getUpdatedPosition(dimensions, updateViewsContext.elapsedTimeMillis)

        this.gameEntityView = { 
            zoom: ZOOM,
            offset: cameraOffset,
            entities: LocationManager.instance.currentLocation.getEntities().concat([
                CutsceneManager.instance.getEntity(), 
                WorldTime.instance.getEntity(), 
                PointLightMaskRenderer.instance.getEntity(),
                GroundRenderer.instance.getEntity(),
            ])
        }

        this.uiView = {
            zoom: ZOOM,
            offset: Point.ZERO,
            entities: UIStateManager.instance.get(dimensions, updateViewsContext.elapsedTimeMillis)
        }
    }
}
