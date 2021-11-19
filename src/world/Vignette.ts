import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { Color, getRGB } from "../ui/Color"
import { DarknessMask } from "./DarknessMask"

export class Vignette extends Component {
    private buffer = 50 // pixels from beyond the edge of the map (useful for covering clipping things)
    private padding = 128 // distance from start of shadows to the edge of the screen
    private rings = 8
    private ringWidth = this.padding / this.rings

    constructor(topLeftPosition: Point, diameter: number) {
        super()
        this.start = () => {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = diameter + this.buffer * 2
            const context = canvas.getContext("2d")
            context.fillStyle = Color.BLACK
            context.fillRect(0, 0, canvas.width, canvas.height)
            context.clearRect(this.buffer, this.buffer, diameter, diameter)
            const imageData = context.getImageData(0, 0, diameter, diameter)
            const rgb = getRGB(Color.BLACK)

            const edge = this.rings * (this.ringWidth * 1.5)

            for (let ring = 0; ring < this.rings; ring++) {
                const n = 4 // superellipse n parameter
                const radius = diameter / 2 - (this.rings - ring - 1) * this.ringWidth
                const r = Math.pow(radius, n)

                const colorPx = (x: number, y: number) => {
                    const i = (x + y * diameter) * 4
                    const xa = Math.pow(x - diameter / 2, n)
                    const yb = Math.pow(y - diameter / 2, n)
                    if (xa + yb > r) {
                        imageData.data[i + 0] = rgb[0]
                        imageData.data[i + 1] = rgb[1]
                        imageData.data[i + 2] = rgb[2]
                        imageData.data[i + 3] = ((255 * (ring + 1)) / this.rings) * 0.95
                    }
                }

                for (let x = 0; x < diameter; x++) {
                    for (let y = 0; y < edge; y++) {
                        colorPx(x, y)
                    }
                    for (let y = diameter - edge; y < diameter; y++) {
                        colorPx(x, y)
                    }
                }
                for (let y = 0; y < diameter; y++) {
                    for (let x = 0; x < edge; x++) {
                        colorPx(x, y)
                    }
                    for (let x = diameter - edge; x < diameter; x++) {
                        colorPx(x, y)
                    }
                }
            }

            context.putImageData(imageData, this.buffer, this.buffer)

            this.getRenderMethods = () => [
                new ImageRender(
                    canvas,
                    new Point(0, 0),
                    new Point(canvas.width, canvas.height),
                    topLeftPosition.plus(new Point(-this.buffer, -this.buffer)),
                    new Point(canvas.width, canvas.height),
                    DarknessMask.DEPTH - 1 // make sure this goes below the darkness mask
                ),
            ]
        }
    }
}
