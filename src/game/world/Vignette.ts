import { Component } from "../../engine/component"
import { Point } from "../../engine/point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Color, getRGB } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"

export class Vignette extends Component {

    private padding = 128
    private rings = 8
    private ringWidth = this.padding/this.rings

    private render: ImageRender

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
                    const distFromLightEdge = dist - (diameter/2 - this.padding)
                    if (distFromLightEdge > 0) {
                        const ring = Math.min(Math.floor(distFromLightEdge/this.ringWidth), this.rings)
                        imageData.data[i+0] = rgb[0]
                        imageData.data[i+1] = rgb[1]
                        imageData.data[i+2] = rgb[2]
                        imageData.data[i+3] = 255 * ring/this.rings * .95
                    }
                }
            }

            context.putImageData(imageData, 0, 0)

            this.render = new ImageRender(
                canvas,
                new Point(0, 0),
                new Point(diameter, diameter),
                topLeftPosition,
                new Point(diameter, diameter),
                UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
            )
        }
    }

    getRenderMethods = () => [this.render]
}