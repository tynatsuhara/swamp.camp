import { UpdateViewsContext } from "../../engine/engine"
import { View } from "../../engine/View"
import { Camera } from "../cutscenes/Camera"
import { LocationManager } from "../world/LocationManager"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { WorldTime } from "../world/WorldTime"
import { GroundRenderer } from "../world/GroundRenderer"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { Point } from "../../engine/point"
import { UIStateManager } from "../ui/UIStateManager"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { EventQueue } from "../world/events/EventQueue"
import { MapGenerator } from "../world/MapGenerator"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { CollisionEngine } from "../../engine/collision/CollisionEngine"
import { DroppedItem } from "../items/DroppedItem"
import { Dude } from "../characters/Dude"
import { Elements } from "../world/elements/Elements"
import { Ground } from "../world/ground/Ground"

const ZOOM = 3

export class GameScene {

    private gameEntityView: View
    private uiView: View

    initialize() {
        CollisionEngine.instance.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.PLAYER_COLLISION_LAYER, Dude.NPC_COLLISION_LAYER]],
            [Dude.PLAYER_COLLISION_LAYER, [Dude.NPC_COLLISION_LAYER]],
        ]))

        // Initialize singletons
        new Tilesets()
        new UIStateManager()
        new DudeFactory()
        new Elements()
        new Ground()
        new Camera()
        new CutsceneManager()
        new PointLightMaskRenderer()
        new GroundRenderer()
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
    
    getViews(updateViewsContext: UpdateViewsContext) {
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