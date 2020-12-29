import { CollisionEngine, collisionEngine } from "../../engine/collision/CollisionEngine"
import { UpdateViewsContext } from "../../engine/engine"
import { Point } from "../../engine/point"
import { View } from "../../engine/View"
import { Dude } from "../characters/Dude"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DroppedItem } from "../items/DroppedItem"
import { saveManager } from "../SaveManager"
import { UIStateManager } from "../ui/UIStateManager"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { MapGenerator } from "../world/MapGenerator"
import { PointLightMaskRenderer } from "../world/PointLightMaskRenderer"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { NPC } from "../characters/NPC"

const ZOOM = 3

export class GameScene {

    private gameEntityView: View
    private uiView: View

    initialize() {
        collisionEngine.setCollisionMatrix(new Map([
            [CollisionEngine.DEFAULT_LAYER, [DroppedItem.COLLISION_LAYER, Dude.PLAYER_COLLISION_LAYER, Dude.NPC_COLLISION_LAYER]],
            [Dude.PLAYER_COLLISION_LAYER, [Dude.NPC_COLLISION_LAYER]],
        ]))
    }

    continueGame() {
        // Wait to initialize since it will begin a coroutine
        PointLightMaskRenderer.instance.start()

        saveManager.load()
    }

    newGame() {
        saveManager.deleteSave()

        // Wait to initialize since it will begin a coroutine
        PointLightMaskRenderer.instance.start()
        WorldTime.instance.initialize(TimeUnit.HOUR * 19.5)
        
        // World must be initialized before we do anything else
        MapGenerator.instance.generateExterior()

        const playerStartPos = MapGenerator.ENTER_LAND_POS
        const playerDude = DudeFactory.instance.new(DudeType.PLAYER, playerStartPos)

        Camera.instance.focusOnDude(playerDude)

        DudeFactory.instance.new(DudeType.DIP, Point.ZERO)
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(3, 1).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-1, 3).times(TILE_SIZE))
        DudeFactory.instance.new(DudeType.ORC_WARRIOR, new Point(-4, 0).times(TILE_SIZE))

        // TODO clean up obstacles (trees, rocks, etc) so intro goes smoothly
        CutsceneManager.instance.startCutscene(new IntroCutscene())

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY
        })
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