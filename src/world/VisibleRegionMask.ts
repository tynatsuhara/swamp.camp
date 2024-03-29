import { Component, debug, Entity, Point } from "brigsby/dist"
import { ImageRender } from "brigsby/dist/renderer"
import { Singletons } from "../core/Singletons"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { DarknessMask } from "./DarknessMask"
import { here } from "./locations/LocationManager"

export class VisibleRegionMask extends Component {
    static get instance() {
        return Singletons.getOrCreate(VisibleRegionMask, () =>
            new Entity().addComponent(new VisibleRegionMask())
        )
    }

    private buffer = 200 // pixels from beyond the edge of the map (useful for covering clipping things)
    private padding = 128 // distance from start of shadows to the edge of the screen
    private rings = 8
    private ringWidth = this.padding / this.rings

    constructor() {
        super()
        this.refresh()
    }

    refresh() {
        // only used for exteriors
        if (here().isInterior) {
            return
        }

        const height = here().size * TILE_SIZE
        const width = height

        const topLeftPosition = new Point(1, 1).times(-height / 2)

        const canvas = document.createElement("canvas")
        canvas.width = width + this.buffer * 2
        canvas.height = height + this.buffer * 2
        const context = canvas.getContext("2d")

        // draw borders over edge
        context.fillStyle = Color.BLACK
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.clearRect(this.buffer, this.buffer, width, height)

        /*
            const imageData = context.getImageData(0, 0, width, height)
            const rgb = getRGB(Color.BLACK)

            const distanceFromEdge = this.rings * (this.ringWidth * 1.5)

            for (let ring = 0; ring < this.rings; ring++) {
                // see https://en.wikipedia.org/wiki/Squircle
                const n = 4 // superellipse n parameter
                const ringDiff = (this.rings - ring - 1) * this.ringWidth
                const ra = Math.pow(width / 2 - ringDiff, n)
                const rb = Math.pow(height / 2 - ringDiff, n)

                const colorPx = (x: number, y: number) => {
                    const i = (x + y * width) * 4
                    const xa = Math.pow(x - width / 2, n) / ra
                    const yb = Math.pow(y - height / 2, n) / rb
                    if (xa + yb > 1) {
                        imageData.data[i + 0] = rgb[0]
                        imageData.data[i + 1] = rgb[1]
                        imageData.data[i + 2] = rgb[2]
                        imageData.data[i + 3] = ((255 * (ring + 1)) / this.rings) * 0.95
                    }
                }

                // color all pixels (skips checking the center pixels)
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < distanceFromEdge; y++) {
                        colorPx(x, y)
                    }
                    for (let y = height - distanceFromEdge; y < height; y++) {
                        colorPx(x, y)
                    }
                }
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < distanceFromEdge; x++) {
                        colorPx(x, y)
                    }
                    for (let x = width - distanceFromEdge; x < width; x++) {
                        colorPx(x, y)
                    }
                }
            }

            context.putImageData(imageData, this.buffer, this.buffer)
            */

        this.getRenderMethods = () => {
            if (debug.disableVisibleRegionMask) {
                return []
            }
            return [
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
