import { debug, Entity, Point, Scene, UpdateViewsContext } from "brigsby/dist"
import { CollisionEngine, collisionEngine } from "brigsby/dist/collision"
import {
    BasicRenderComponent,
    EllipseRender,
    LineRender,
    RectRender,
    RenderMethod,
} from "brigsby/dist/renderer"
import { Dude } from "../characters/Dude"
import { DudeFactory } from "../characters/DudeFactory"
import { DudeSpawner } from "../characters/DudeSpawner"
import { DudeType } from "../characters/DudeType"
import { NPC } from "../characters/NPC"
import { player } from "../characters/player"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { CutsceneManager } from "../cutscenes/CutsceneManager"
import { IntroCutscene } from "../cutscenes/IntroCutscene"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { DevControls } from "../debug/DevControls"
import { ProfilerData } from "../debug/ProfilerData"
import { spawnMenu } from "../debug/SpawnMenu"
import { Particles } from "../graphics/particles/Particles"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DroppedItem } from "../items/DroppedItem"
import { Singletons } from "../Singletons"
import { ZOOM } from "../SwampCampGame"
import { ButtonsMenu, OptionButton } from "../ui/ButtonsMenu"
import { Color } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { Elements } from "../world/elements/Elements"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { GroundRenderer } from "../world/GroundRenderer"
import { LightManager } from "../world/LightManager"
import { CampLocationGenerator } from "../world/locations/CampLocationGenerator"
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
        Singletons.clear()

        WorldTime.instance.initialize(TimeUnit.HOUR * 18.5)

        // World must be initialized before we do anything else

        CampLocationGenerator.instance.generate()
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
    }

    getViews(updateViewsContext: UpdateViewsContext) {
        const cameraOffset = Camera.instance.getUpdatedPosition(
            updateViewsContext.elapsedTimeMillis
        )

        const uiEntities = [...this.getUiSpaceDebugEntities()]

        const gameEntities: Entity[] = [
            CutsceneManager.instance.getEntity(),
            this.getWorldSpaceDebugEntity(),
            new Entity([new DevControls()]),
        ]

        if (TextOverlayManager.instance.isActive) {
            uiEntities.unshift(TextOverlayManager.instance.getEntity())
        }

        const pauseBackground =
            TextOverlayManager.instance.isActive &&
            TextOverlayManager.instance.shouldPauseBackground

        if (!pauseBackground) {
            uiEntities.unshift(...UIStateManager.instance.get(updateViewsContext.elapsedTimeMillis))
            gameEntities.push(
                ...here().getEntities(),
                ...LightManager.instance.getEntities(),
                WorldTime.instance.getEntity(),
                DudeSpawner.instance.getEntity(),
                Particles.instance.getEntity()
            )
            if (!debug.groundRenderDisabled) {
                gameEntities.push(GroundRenderer.instance.getEntity())
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

    private getWorldSpaceDebugEntity(): Entity {
        if (!player()) {
            return
        }

        const e = new Entity()

        if (debug.showGrid) {
            const base = player().tile
            const lines: RenderMethod[] = []
            const gridRange = 50

            // vertical lines
            for (let i = -gridRange; i < gridRange; i++) {
                const top = base
                    .times(TILE_SIZE)
                    .plusX(i * TILE_SIZE)
                    .plusY(-gridRange * TILE_SIZE)
                lines.push(new LineRender(top, top.plusY(2 * gridRange * TILE_SIZE), "#0000FF7E"))
            }

            // horizontal lines
            for (let i = -gridRange; i < gridRange; i++) {
                const left = base
                    .times(TILE_SIZE)
                    .plusX(-gridRange * TILE_SIZE)
                    .plusY(i * TILE_SIZE)
                lines.push(new LineRender(left, left.plusX(2 * gridRange * TILE_SIZE), "#0000FF7E"))
            }

            e.addComponent(new BasicRenderComponent(...lines))
        }

        if (debug.showTeleporters) {
            const pts = here().getTeleporterLocations()
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

        if (debug.showNavMesh) {
            const pts = here().getOccupiedSpots()
            const renders = pts.map(
                (pt) =>
                    new RectRender({
                        depth: Number.MAX_SAFE_INTEGER,
                        position: pt.times(TILE_SIZE),
                        dimensions: new Point(TILE_SIZE, TILE_SIZE),
                        color: "#0000FF7E",
                    })
            )

            e.addComponent(new BasicRenderComponent(...renders))
        }

        if (debug.showGroundTiles) {
            const pts = here().getGroundSpots(true)
            const renders = pts.map(
                (pt) =>
                    new RectRender({
                        depth: Number.MAX_SAFE_INTEGER,
                        position: pt.times(TILE_SIZE),
                        dimensions: new Point(TILE_SIZE, TILE_SIZE),
                        color: "#00FFFF7E",
                    })
            )

            e.addComponent(new BasicRenderComponent(...renders))
        }

        if (debug.showElementGrid) {
            const renders = here()
                .getElements()
                .map(
                    (el) =>
                        new RectRender({
                            depth: Number.MAX_SAFE_INTEGER,
                            position: el.pos.times(TILE_SIZE),
                            dimensions: Elements.instance
                                .getElementFactory(el.type)
                                .dimensions.times(TILE_SIZE),
                            color: "#A000A07E",
                        })
                )

            e.addComponent(new BasicRenderComponent(...renders))
        }

        // TODO figure out a nice way to draw pixelated lines for bomb tossing
        // e.addComponent(
        //     new ThrowableArc(
        //         Player.instance.dude.standingPosition,
        //         controls.getWorldSpaceMousePos()
        //     )
        // )

        return e
    }

    private getUiSpaceDebugEntities(): Entity[] {
        const result = []

        if (spawnMenu.isOpen) {
            const selectedType = spawnMenu.getSelectedType()
            const pageStart = spawnMenu.page * spawnMenu.pageSize
            const dudeTypeButtons: OptionButton[] = [
                selectedType,
                ...spawnMenu.types.filter((t) => t !== selectedType),
            ]
                .slice(pageStart, pageStart + spawnMenu.pageSize)
                .map((type, index) => ({
                    text:
                        type === selectedType
                            ? `[SELECTED] ${DudeType[type]}`
                            : `SPAWN ${DudeType[type]}`,
                    fn: () => {
                        spawnMenu.setSelectedType(type)
                        console.log(`press [O] to spawn ${DudeType[type]} at mouse position`)
                        spawnMenu.isOpen = false
                    },
                    buttonColor: "white",
                    textColor: Color.WHITE,
                    hoverColor: Color.RED_2,
                }))

            const nextPageButton: OptionButton = {
                text: "NEXT",
                fn: () => {
                    spawnMenu.page++
                    if (spawnMenu.page * spawnMenu.pageSize > spawnMenu.types.length) {
                        spawnMenu.page = 0
                    }
                },
                buttonColor: "white",
                textColor: Color.WHITE,
                hoverColor: Color.RED_2,
            }

            const buttons = [...dudeTypeButtons, nextPageButton]

            result.push(ButtonsMenu.render("white", buttons, Camera.instance.dimensions.div(2)))
        }

        if (debug.showProfiler) {
            result.push(new Entity([new ProfilerData()]))
        }

        return result
    }
}
