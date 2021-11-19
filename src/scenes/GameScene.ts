import { CollisionEngine, collisionEngine } from "brigsby/dist/collision/CollisionEngine"
import { UpdateViewsContext } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { Dude } from "../characters/Dude"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { pixelPtToTilePt, TILE_SIZE } from "../graphics/Tilesets"
import { DroppedItem } from "../items/DroppedItem"
import { UIStateManager } from "../ui/UIStateManager"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { MapGenerator } from "../world/MapGenerator"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { NPC } from "../characters/NPC"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { Player } from "../characters/Player"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { LineRender } from "brigsby/dist/renderer/LineRender"
import { Entity } from "brigsby/dist/Entity"
import { debug } from "brigsby/dist/Debug"
import { DudeSpawner } from "../characters/DudeSpawner"
import { DevControls } from "../DevControls"
import { LightManager } from "../world/LightManager"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { Singletons } from "../Singletons"
import { Particles } from "../graphics/Particles"

export class GameScene {
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
                [Dude.PLAYER_COLLISION_LAYER, [Dude.NPC_COLLISION_LAYER]],
                // [Barrier.PLAYER_ONLY, [Dude.PLAYER_COLLISION_LAYER]]
            ])
        )
    }

    newGame() {
        Singletons.destroy()

        WorldTime.instance.initialize(TimeUnit.HOUR * 18.5)

        // World must be initialized before we do anything else
        MapGenerator.instance.generateExterior()

        const playerStartPos = LocationManager.instance.exteriorEntrancePosition()
        const playerDude = DudeFactory.instance.new(DudeType.PLAYER, playerStartPos)

        // Camera.instance.clearPosition()
        Camera.instance.focusOnDude(playerDude)

        CutsceneManager.instance.startCutscene(new IntroCutscene())

        EventQueue.instance.addEvent({
            type: QueuedEventType.SIMULATE_NPCS,
            time: WorldTime.instance.time + NPC.SCHEDULE_FREQUENCY,
        })
    }

    getViews(updateViewsContext: UpdateViewsContext) {
        const cameraOffset = Camera.instance.getUpdatedPosition(
            updateViewsContext.elapsedTimeMillis
        )

        // full-screen text overlay that pauses gameplay
        const isTextOverlayActive = TextOverlayManager.instance.isActive

        const uiEntities = isTextOverlayActive
            ? [TextOverlayManager.instance.getEntity()]
            : UIStateManager.instance.get(updateViewsContext.elapsedTimeMillis)

        const gameEntities: Entity[] = [
            CutsceneManager.instance.getEntity(),
            this.getDebugEntity(),
            new Entity([new DevControls()]),
        ]

        if (!isTextOverlayActive) {
            gameEntities.push(
                ...LocationManager.instance.currentLocation.getEntities(),
                ...LightManager.instance.getEntities(),
                WorldTime.instance.getEntity(),
                GroundRenderer.instance.getEntity(),
                DudeSpawner.instance.getEntity(),
                Particles.instance.getEntity()
            )
        }

        return [
            {
                zoom: Camera.ZOOM,
                offset: cameraOffset,
                entities: gameEntities,
            },
            {
                zoom: Camera.ZOOM,
                offset: Point.ZERO,
                entities: uiEntities,
            },
        ]
    }

    private getDebugEntity() {
        if (!Player.instance?.dude || !debug.showGrid) {
            return
        }

        const base = pixelPtToTilePt(Player.instance.dude.standingPosition)
        const lines: RenderMethod[] = []
        const gridRange = 50

        // vertical lines
        for (let i = -gridRange; i < gridRange; i++) {
            const top = base
                .times(TILE_SIZE)
                .plusX(i * TILE_SIZE)
                .plusY(-gridRange * TILE_SIZE)
            lines.push(new LineRender(top, top.plusY(2 * gridRange * TILE_SIZE)))
        }

        // horizontal lines
        for (let i = -gridRange; i < gridRange; i++) {
            const left = base
                .times(TILE_SIZE)
                .plusX(-gridRange * TILE_SIZE)
                .plusY(i * TILE_SIZE)
            lines.push(new LineRender(left, left.plusX(2 * gridRange * TILE_SIZE)))
        }

        return new Entity([new BasicRenderComponent(...lines)])
    }
}
