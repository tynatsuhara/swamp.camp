import { Component, Point } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { SpriteTransform, SpriteTransformOptions, StaticSpriteSource } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { controls } from "../Controls"
import { player } from "../characters/player"
import { Camera } from "../cutscenes/Camera"
import { ImageFilters } from "../graphics/ImageFilters"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { createWorker } from "../workers/index"
import { DrawMiniMap, MiniMapDrawn } from "../workers/minimap"
import { LightManager } from "../world/LightManager"
import { ElementComponent } from "../world/elements/ElementComponent"
import { GroundComponent } from "../world/ground/GroundComponent"
import { GroundRenderer } from "../world/ground/GroundRenderer"
import { WaterRenderer } from "../world/ground/WaterRenderer"
import { camp, here } from "../world/locations/LocationManager"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"
import { UI_SPRITE_DEPTH } from "./UiConstants"

export class MiniMap extends Component {
    private static readonly SCALE = 12 // full-size pixels per map pixel
    private needsRefresh = false
    private fullyRenderedAtLeastOnce = false
    private isShowing = false
    private redrawMap: (request: DrawMiniMap) => void
    private bigCanvas: HTMLCanvasElement
    private smallCanvas: HTMLCanvasElement

    update() {
        this.isShowing =
            !UIStateManager.instance.isMenuOpen && controls.isMapKeyHeld() && here() === camp()

        const wl = camp()

        if (!this.bigCanvas) {
            this.bigCanvas = document.createElement("canvas")
            this.bigCanvas.width = this.bigCanvas.height = wl.size * TILE_SIZE
        }

        if (!this.redrawMap) {
            const [redraw, onDrawn] = createWorker<DrawMiniMap, MiniMapDrawn>("minimap")
            this.redrawMap = redraw
            this.smallCanvas = document.createElement("canvas", {})
            this.smallCanvas.width = this.smallCanvas.height = this.bigCanvas.width / MiniMap.SCALE
            onDrawn((response: MiniMapDrawn) => {
                this.fullyRenderedAtLeastOnce = true
                this.smallCanvas.getContext("2d").putImageData(response.imageData, 0, 0)
            })
        }

        if (this.needsRefresh) {
            this.renderFullSizeMap()

            const { width, height } = this.bigCanvas
            this.redrawMap({
                imageData: this.bigCanvas.getContext("2d").getImageData(0, 0, width, height),
                width,
                height,
                // smallCanvas: initSmallCanvas ? this.smallCanvas : undefined,
                scale: MiniMap.SCALE,
            })

            this.needsRefresh = false
        }
    }

    refresh() {
        this.needsRefresh = true
    }

    getRenderMethods() {
        if (!this.isShowing || !this.fullyRenderedAtLeastOnce) {
            return []
        }

        const padding = 4
        const topLeft = new Point(
            padding,
            Camera.instance.dimensions.y - this.smallCanvas.height - padding
        ).apply(Math.floor)

        return [...this.getMapSprites(topLeft), this.getPlayerIndicator(topLeft)]
    }

    private renderFullSizeMap() {
        const wl = camp()
        const ground = GroundRenderer.instance.getCanvas(wl)
        const water = WaterRenderer.instance.getCanvas(wl)
        if (!ground || !water) {
            return
        }

        // first, draw everything onto a full-size canvas
        const context = this.bigCanvas.getContext("2d", { willReadFrequently: true })

        // draw the ground from the groundrenderer
        context.drawImage(ground, 0, 0)
        context.drawImage(water, 0, 0)

        // draw entities
        const entities = wl.getEntities()
        const mapOffset = (wl.size / 2) * TILE_SIZE
        entities
            .filter((e) => e.getComponent(ElementComponent) || e.getComponent(GroundComponent))
            .flatMap((ec) =>
                ec.components
                    .filter((c) => c?.enabled)
                    .flatMap((c) => c.getRenderMethods().filter((rm) => rm instanceof ImageRender))
            )
            .sort((a, b) => a.depth - b.depth)
            .forEach((rm) => {
                const render = rm as ImageRender
                context.drawImage(
                    render.source,
                    render.sourcePosition.x,
                    render.sourcePosition.y,
                    render.sourceDimensions.x,
                    render.sourceDimensions.y,
                    render.position.x + mapOffset,
                    render.position.y + mapOffset,
                    render.dimensions.x,
                    render.dimensions.y
                )
            })
    }

    private mapDarknessOverlay: StaticSpriteSource
    private getMapSprites(topLeft: Point) {
        const mapSprite = new StaticSpriteSource(
            this.smallCanvas,
            Point.ZERO,
            new Point(this.smallCanvas.width, this.smallCanvas.height)
        )
        if (!this.mapDarknessOverlay) {
            this.mapDarknessOverlay = mapSprite.filtered(ImageFilters.tint(Color.BLACK))
        }

        const transformArgs: SpriteTransformOptions = {
            position: topLeft,
            depth: UI_SPRITE_DEPTH,
        }
        const mapRender = mapSprite.toImageRender(SpriteTransform.new(transformArgs))

        const mapOverlayRender = this.mapDarknessOverlay.toImageRender(
            SpriteTransform.new({
                ...transformArgs,
                depth: transformArgs.depth + 1,
            })
        )
        const visibility = LightManager.instance.currentVisibility(player().standingPosition)
        mapOverlayRender.alpha = Math.min(1 - visibility, 0.95)

        return [mapRender, mapOverlayRender]
    }

    // MPTODO: Multiple player indicators?
    private getPlayerIndicator(topLeft: Point) {
        const indicatorSize = 4
        const playerIndicatorPosition = player()
            .standingPosition.plus(new Point(1, 1).times((camp().size * TILE_SIZE) / 2))
            .div(MiniMap.SCALE)
            .minus(new Point(indicatorSize / 2, indicatorSize / 2))
            .apply((n) => Math.floor(n))
            .apply((n) =>
                Maths.clamp(n, 0, (camp().size * TILE_SIZE) / MiniMap.SCALE - indicatorSize)
            )
            .plus(topLeft)

        return Tilesets.instance.oneBit.getTileSource("miniMapPlayer").toImageRender(
            SpriteTransform.new({
                position: playerIndicatorPosition,
                depth: UI_SPRITE_DEPTH,
            })
        )
    }
}
