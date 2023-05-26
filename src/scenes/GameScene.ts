import { debug, Entity, Point, Scene, UpdateViewsContext } from "brigsby/dist"
import { CollisionEngine, collisionEngine } from "brigsby/dist/collision"
import { Dude } from "../characters/Dude"
import { DudeFactory } from "../characters/DudeFactory"
import { DudeSpawner } from "../characters/DudeSpawner"
import { DudeType } from "../characters/DudeType"
import { NPC } from "../characters/NPC"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { DevControls } from "../debug/DevControls"
import { getUiSpaceDebugEntities, getWorldSpaceDebugEntity } from "../debug/GameDebugEntities"
import { Particles } from "../graphics/particles/Particles"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DroppedItem } from "../items/DroppedItem"
import { ZOOM } from "../SwampCampGame"
import { UIStateManager } from "../ui/UIStateManager"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { GroundRenderer } from "../world/ground/GroundRenderer"
import { WaterRenderer } from "../world/ground/WaterRenderer"
import { LightManager } from "../world/LightManager"
import { LocationFactory } from "../world/locations/LocationFactory"
import { camp, here, LocationManager } from "../world/locations/LocationManager"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"

export class GameScene extends Scene {
    initialize() {
        collisionEngine.setCollisionMatrix(
            new Map([
                [
                    CollisionEngine.DEFAULT_LAYER,
                    [
                        DroppedItem.COLLISION_LAYER,
                        Dude.PLAYER_COLLISION_LAYER,
                        Dude.NPC_COLLISION_LAYER,
                    ],
                ],
            ])
        )
    }

    newGame() {
        WorldTime.instance.initialize(TimeUnit.HOUR * 18.5)

        // World must be initialized before we do anything else

        LocationFactory.instance.newCamp().then(() => {
            LocationManager.instance.loadLocation(camp())

            const playerStartPos = new Point(camp().size, camp().size).times(TILE_SIZE)
            const playerDude = DudeFactory.instance.create(DudeType.PLAYER, playerStartPos)

            // Camera.instance.clearPosition()
            Camera.instance.focusOnDude(playerDude)

            CutsceneManager.instance.startCutscene(new IntroCutscene())

            EventQueue.instance.addEvent({
                type: QueuedEventType.SIMULATE_NPCS,
                time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY,
            })
        })
    }

    getViews(updateViewsContext: UpdateViewsContext) {
        const cameraOffset = Camera.instance.getUpdatedPosition(
            updateViewsContext.elapsedTimeMillis
        )

        const uiEntities = [...getUiSpaceDebugEntities()]

        const gameEntities: Entity[] = [
            CutsceneManager.instance.getEntity(),
            getWorldSpaceDebugEntity(),
            new Entity([new DevControls()]),
        ]

        if (TextOverlayManager.instance.isActive) {
            uiEntities.unshift(TextOverlayManager.instance.getEntity())
        }

        const pauseBackground =
            TextOverlayManager.instance.isActive &&
            TextOverlayManager.instance.shouldPauseBackground

        if (!pauseBackground) {
            uiEntities.unshift(...UIStateManager.instance.get())
            gameEntities.push(
                ...here().getEntities(),
                ...LightManager.instance.getEntities(),
                WorldTime.instance.getEntity(),
                DudeSpawner.instance.getEntity(),
                Particles.instance.getEntity()
            )
            if (!debug.groundRenderDisabled) {
                gameEntities.push(GroundRenderer.instance.getEntity())
                gameEntities.push(WaterRenderer.instance.getEntity())
            }
        }

        return [
            {
                zoom: ZOOM,
                offset: Point.ZERO,
                entities: [controls.entity],
            },
            {
                zoom: ZOOM,
                offset: cameraOffset,
                entities: gameEntities,
            },
            {
                zoom: ZOOM,
                offset: Point.ZERO,
                entities: uiEntities,
            },
        ]
    }
}
