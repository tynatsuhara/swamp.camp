import { Point } from "../../engine/point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { Camera } from "../cutscenes/Camera"
import { MapGenerator } from "./MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { assets } from "../../engine/Assets"
import { Grid } from "../../engine/util/Grid"
import { UIStateManager } from "../ui/UIStateManager"

export class PointLightMaskRenderer {

    static instance: PointLightMaskRenderer

    // no lights should live outside of this range
    private size = MapGenerator.MAP_SIZE * TILE_SIZE * 2
    private shift = new Point(this.size/2, this.size/2)
    private lightTiles: Grid<boolean> = new Grid()
    private gridDirty = true
    private canvas: HTMLCanvasElement

    constructor() {
        PointLightMaskRenderer.instance = this

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size

        this.renderToOffscreenCanvas()
    }

    addLight(tilePos: Point) {
        this.checkPt(tilePos)
        this.lightTiles.set(tilePos, true)
        this.gridDirty = true
    }

    removeLight(tilePos: Point) {
        this.checkPt(tilePos)
        this.lightTiles.remove(tilePos)
        this.gridDirty = true
    }

    private checkPt(tilePos) {
        const pxPt = tilePos.times(TILE_SIZE)
        const lim = this.size/2
        if (pxPt.x < -lim || pxPt.x > lim || pxPt.y < -lim || pxPt.y > lim) {
            throw new Error("light is outside of valid bounds")
        }
    }

    renderToOffscreenCanvas() {
        const context = this.canvas.getContext("2d")
        context.globalCompositeOperation = "source-over"
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        context.fillStyle = "rgba(0, 0, 0, 0.4)"
        context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        context.globalCompositeOperation = "destination-out"

        const circle = assets.getImageByFileName("images/circles.png")
        // right now all lights are 5x5 tiles
        const circleOffset = new Point(-2, -2).times(TILE_SIZE)

        this.lightTiles.entries().map(entry => entry[0]).forEach(pos => {
            const adjustedPos = pos.times(TILE_SIZE).plus(this.shift).plus(circleOffset)
            context.drawImage(circle, adjustedPos.x, adjustedPos.y)
        })
    }

    getEntities() {
        if (this.gridDirty) {
            this.renderToOffscreenCanvas()
            this.gridDirty = false
        }

        // prevent tint not extending to the edge
        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))

        return [new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            Camera.instance.position.plus(this.shift),
            dimensions,
            Camera.instance.position,
            dimensions,
            UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
        ))])]
    }
}