import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color, getRGB } from "../ui/Color"
import { DarknessMask } from "./DarknessMask"
import { MapGenerator } from "./MapGenerator"

export class Vignette extends Component {

    private padding = 128  // distance from start of shadows to the edge of the screen
    private rings = 8
    private ringWidth = this.padding/this.rings

    constructor(topLeftPosition: Point, diameter: number) {
        super()
        this.start = () => {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = diameter
            const context = canvas.getContext("2d")
            const imageData = context.getImageData(0, 0, diameter, diameter)
            const rgb = getRGB(Color.BLACK)
            
            const center = new Point(diameter/2, diameter/2).apply(Math.floor)
            for (let ring = 0; ring < this.rings; ring++) {
                const n = 4  // superellipse n parameter
                const radius = MapGenerator.MAP_SIZE/2 * TILE_SIZE - ((this.rings - ring - 1) * this.ringWidth)
                const r = Math.pow(radius, n)

                for (let x = 0; x < diameter; x++) {
                    for (let y = 0; y < diameter; y++) {
                        const i = (x + y * diameter) * 4
                        const xa = Math.pow(x - diameter/2, n)
                        const yb = Math.pow(y - diameter/2, n)
                        if (xa + yb > r) {
                            imageData.data[i+0] = rgb[0]
                            imageData.data[i+1] = rgb[1]
                            imageData.data[i+2] = rgb[2]
                            imageData.data[i+3] = 255 * (ring+1)/this.rings * .95
                        }
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
                    DarknessMask.DEPTH - 1  // make sure this goes below the darkness mask
                )
            ]
        }
    }
}