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

    private lightTiles: Grid<number> = new Grid()
    private gridDirty = true
    private darkness = 0.4

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        PointLightMaskRenderer.instance = this

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size
        this.context = this.canvas.getContext("2d")

        this.renderToOffscreenCanvas()
    }

    addLight(position: Point, diameter: number = 16) {
        if (diameter % 2 !== 0) {
            throw new Error("only even circle px diameters work right now")
        }
        this.checkPt(position)
        this.lightTiles.set(position, diameter)
        this.gridDirty = true
    }

    removeLight(position: Point) {
        this.checkPt(position)
        this.lightTiles.remove(position)
        this.gridDirty = true
    }

    private checkPt(position) {
        const lim = this.size/2
        if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
            throw new Error("light is outside of valid bounds")
        }
    }

    renderToOffscreenCanvas() {
        this.context.fillStyle = `rgba(34, 34, 34, ${this.darkness})`
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.lightTiles.entries().forEach(entry => {
            const pos = entry[0]
            const diameter = entry[1]
            const circleOffset = new Point(-.5, -.5).times(diameter)
            const adjustedPos = pos.plus(this.shift).plus(circleOffset)//.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
            
            this.makeCircle(diameter, adjustedPos, this.darkness/2)

            const innerOffset = Math.floor(diameter/2 * 1/4)
            this.makeCircle(diameter-innerOffset*2, adjustedPos.plus(new Point(innerOffset, innerOffset)), 0)
        })
    }

    makeCircle(diameter: number, position: Point, alpha: number) {
        const center = new Point(diameter/2, diameter/2).minus(new Point(.5, .5))
        const imageData = this.context.getImageData(position.x, position.y, diameter, diameter)

        for (let x = 0; x < diameter; x++) {
            for (let y = 0; y < diameter; y++) {
                const i = (x + y * diameter) * 4
                const pt = new Point(x, y)
                const withinCircle = pt.distanceTo(center) < diameter/2
                if (withinCircle) {
                    // imageData.data[i+3] -= Math.max(0, Math.ceil(255 * alphaSubtraction))
                    imageData.data[i+3] = Math.min(imageData.data[i+3], Math.ceil(255 * alpha))
                }
            }
        }

        this.context.putImageData(imageData, position.x, position.y)
    }

    getEntity(): Entity {
        if (this.gridDirty) {
            this.renderToOffscreenCanvas()
            this.gridDirty = false
        }

        // prevent tint not extending to the edge
        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))

        return new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            Camera.instance.position.plus(this.shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
        ))])
    }
}