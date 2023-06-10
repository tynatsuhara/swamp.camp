import { debug, Entity, Point } from "brigsby/dist"
import {
    BasicRenderComponent,
    EllipseRender,
    LineRender,
    RectRender,
    RenderMethod,
} from "brigsby/dist/renderer"
import { DudeType } from "../characters/DudeType"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ButtonsMenu, OptionButton } from "../ui/ButtonsMenu"
import { Color } from "../ui/Color"
import { Elements } from "../world/elements/Elements"
import { here, LocationManager } from "../world/locations/LocationManager"
import { ProfilerData } from "./ProfilerData"
import { spawnMenu } from "./SpawnMenu"

export const getUiSpaceDebugEntities = (): Entity[] => {
    const result: Entity[] = []

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

        const { entity: menuEntity } = ButtonsMenu.render(
            "spawn",
            "white",
            buttons,
            Camera.instance.dimensions.div(2)
        )
        result.push(menuEntity)

        if (controls.isCloseMenuButtonDown()) {
            spawnMenu.isOpen = false
        }
    }

    if (debug.showProfiler) {
        result.push(new Entity([new ProfilerData()]))
    }

    return result
}

export const getWorldSpaceDebugEntity = (): Entity => {
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
        const pts = LocationManager.instance.getTeleportersHere()
        const renders = pts.map(
            (pt) =>
                new EllipseRender({
                    depth: Number.MAX_SAFE_INTEGER,
                    position: new Point(-2, -2).plus(pt),
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
        const pts = here().getAllGroundSpots()
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
