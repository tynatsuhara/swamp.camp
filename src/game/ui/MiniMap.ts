import { Component } from "../../engine/Component"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Lists } from "../../engine/util/Lists"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ElementComponent } from "../world/elements/ElementComponent"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { getHex } from "./Color"
import { UIStateManager } from "./UIStateManager"

export class MiniMap extends Component {

    private static readonly SCALE = 12  // full-size pixels per map pixel

    private canvas: HTMLCanvasElement

    start() {
        this.renderExterior()
    }

    renderExterior() {
        // TODO: Make this render in chunks to reduce the performance hit

        const wl = LocationManager.instance.exterior()
        const ground = GroundRenderer.instance.getCanvas(wl)

        // first, draw everything onto a full-size canvas
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = wl.size * TILE_SIZE
        const context = canvas.getContext("2d")

        // draw the ground from the groundrenderer
        context.drawImage(ground, 0, 0)

        // draw entities
        const entities = wl.getEntities()
        const mapOffset = wl.size/2 * TILE_SIZE
        entities.filter(e => !!e.getComponent(ElementComponent)).forEach(ec => {
            ec.components.forEach(c => {
                c.getRenderMethods().filter(rm => rm instanceof ImageRender).forEach(rm => {
                    const render = rm as ImageRender
                    context.drawImage(
                        render.source, 
                        render.sourcePosition.x, render.sourcePosition.y,
                        render.sourceDimensions.x, render.sourceDimensions.y,
                        render.position.x + mapOffset, render.position.y + mapOffset,
                        render.dimensions.x, render.dimensions.y
                    )
                })
            })
        })

        // TODO: draw other ground

        // Draw the scaled-down canvas
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.canvas.height = canvas.width / MiniMap.SCALE
        const smallContext = this.canvas.getContext("2d")

        for (let x = 0; x < this.canvas.width; x++) {
            for (let y = 0; y < this.canvas.height; y++) {
                const imageData = context.getImageData(x * MiniMap.SCALE, y * MiniMap.SCALE, MiniMap.SCALE, MiniMap.SCALE)
                // get the most common color from that square
                const hexStrings = []
                for (let i = 0; i < imageData.data.length; i += 4) {
                    hexStrings.push(getHex(imageData.data[i], imageData.data[i+1], imageData.data[2]))
                }
                smallContext.fillStyle = Lists.mode(hexStrings)
                smallContext.fillRect(x, y, 1, 1)
            }
        }
    }
    
    getRenderMethods() {
        const padding = 10
         
        return [new ImageRender(
            this.canvas,
            Point.ZERO,
            new Point(this.canvas.width, this.canvas.height),
            new Point(
                padding,
                Camera.instance.dimensions.y - this.canvas.height - padding
            ),
            new Point(this.canvas.width, this.canvas.height),
            UIStateManager.UI_SPRITE_DEPTH,
        )]
    }
}
