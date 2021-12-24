import { CollisionEngine, collisionEngine } from "brigsby/dist/collision/CollisionEngine"
import { debug } from "brigsby/dist/Debug"
import { UpdateViewsContext } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { EllipseRender } from "brigsby/dist/renderer/EllipseRender"
import { LineRender } from "brigsby/dist/renderer/LineRender"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Dude } from "../characters/Dude"
import { DudeFactory, DudeType } from "../characters/DudeFactory"
import { DudeSpawner } from "../characters/DudeSpawner"
import { NPC } from "../characters/NPC"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { DevControls, spawnMenu } from "../DevControls"
import { Particles } from "../graphics/Particles"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DroppedItem } from "../items/DroppedItem"
import { Singletons } from "../Singletons"
import { ButtonsMenu } from "../ui/ButtonsMenu"
import { Color } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { GroundRenderer } from "../world/GroundRenderer"
import { LightManager } from "../world/LightManager"
import { LocationManager } from "../world/LocationManager"
import { MapGenerator } from "../world/MapGenerator"
import { TimeUnit } from "../world/TimeUnit"
import { WorldTime } from "../world/WorldTime"

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

        uiEntities.push(this.getUiSpaceDebugEntity())

        const gameEntities: Entity[] = [
            CutsceneManager.instance.getEntity(),
            this.getWorldSpaceDebugEntity(),
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
                offset: Point.ZERO,
                entities: [controls.entity],
            },
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

    private getWorldSpaceDebugEntity(): Entity {
        if (!Player.instance?.dude) {
            return
        }

        const e = new Entity()

        if (debug.showGrid) {
            const base = Player.instance.dude.tile
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

            e.addComponent(new BasicRenderComponent(...lines))
        }

        if (debug.showTeleporters) {
            const pts = LocationManager.instance.currentLocation.getTeleporterLocations()
            const renders = pts.map(
                (pt) =>
                    new EllipseRender({
                        depth: Number.MAX_SAFE_INTEGER,
                        position: pt.plus(new Point(-2, -2)),
                        dimensions: new Point(4, 4),
                    })
            )

            e.addComponent(new BasicRenderComponent(...renders))
        }

        return e
    }

    private getUiSpaceDebugEntity() {
        if (spawnMenu.show) {
            const spawnableTypes = [
                DudeType.SHROOM,
                DudeType.NUN,
                DudeType.CLERIC,
                DudeType.BISHOP,
                DudeType.BEAR,
                DudeType.WOLF,
            ]

            return ButtonsMenu.render(
                "white",
                spawnableTypes.map((type) => ({
                    text: `SPAWN ${DudeType[type]}`,
                    fn: () => {
                        spawnMenu.show = false
                        spawnMenu.type = type
                    },
                    buttonColor: "white",
                    textColor: Color.WHITE,
                    hoverColor: Color.DARK_RED,
                })),
                Camera.instance.dimensions.div(2)
            )
        }
    }
}
