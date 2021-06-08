import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color, getRGB } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { MapGenerator } from "./MapGenerator"

export class Vignette extends Component {

    private padding = 128
    private rings = 8
    private ringWidth = this.padding/this.rings
    private readonly R4 = Math.pow(MapGenerator.MAP_SIZE/2 * TILE_SIZE, 4)

    constructor(topLeftPosition: Point, diameter: number) {
        super()
        this.start = () => {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = diameter
            const context = canvas.getContext("2d")
            const imageData = context.getImageData(0, 0, diameter, diameter)
            const rgb = getRGB(Color.BLACK)
            
            const center = new Point(diameter/2, diameter/2).apply(Math.floor)
            for (let x = 0; x < diameter; x++) {
                for (let y = 0; y < diameter; y++) {
                    const i = (x + y * diameter) * 4
                    const pt = new Point(x, y)
                    const dist = pt.distanceTo(center)
                    // how far into the darkness is it?
                    const distFromLightEdge = dist - (diameter/2 - this.padding)
                    if (distFromLightEdge > 0) {
                        // TODO: support squircle vignette
                        // if (xa + yb > this.R4) {
                        // const xa = Math.pow(x - diameter/2, 4)
                        // const yb = Math.pow(y - diameter/2, 4)
                        // const ring = 8
                        const ring = Math.min(Math.floor(distFromLightEdge/this.ringWidth), this.rings)
                        imageData.data[i+0] = rgb[0]
                        imageData.data[i+1] = rgb[1]
                        imageData.data[i+2] = rgb[2]
                        imageData.data[i+3] = 255 * ring/this.rings * .95
                    }
                }
            }

            context.putImageData(imageData, 0, 0)

            this.getRenderMethods = () => [
                new ImageRender(
                    canvas,
                    new Point(0, 0),
                    new Point(diameter, diameter),
                    topLeftPosition,
                    new Point(diameter, diameter),
                    UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
                )
            ]
        }
    }
}