import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Lists } from "../../engine/util/Lists"
import { Controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ElementComponent } from "../world/elements/ElementComponent"
import { GroundComponent } from "../world/ground/GroundComponent"
import { GroundRenderer } from "../world/GroundRenderer"
import { LocationManager } from "../world/LocationManager"
import { Color, getHex } from "./Color"
import { UIStateManager } from "./UIStateManager"

export class MiniMap extends Component {

    private static readonly SCALE = 12          // full-size pixels per map pixel
    private static readonly PX_PER_UPDATE = 50  // how many pixels we draw each time
    private lastPixelDrawn = Point.ZERO
    private fullyRenderedAtLeastOnce = false
    private isShowing = false

    private bigCanvas: HTMLCanvasElement
    private smallCanvas: HTMLCanvasElement

    update(updateData: UpdateData) {
        this.isShowing = updateData.input.isKeyHeld(Controls.mapKey)

        if (this.lastPixelDrawn.equals(Point.ZERO)) {
            this.renderFullSizeMap()
        }
        this.partiallyRenderDownsampledMap()
    }

    refresh() {
        this.lastPixelDrawn = Point.ZERO
    }

    private renderFullSizeMap() {
        const wl = LocationManager.instance.exterior()
        const ground = GroundRenderer.instance.getCanvas(wl)
        if (!ground) {
            return
        }

        // first, draw everything onto a full-size canvas
        if (!this.bigCanvas) {
            this.bigCanvas = document.createElement("canvas")
            this.bigCanvas.width = this.bigCanvas.height = wl.size * TILE_SIZE
        }
        const context = this.bigCanvas.getContext("2d")

        // draw the ground from the groundrenderer
        context.drawImage(ground, 0, 0)

        // draw entities
        const entities = wl.getEntities()
        const mapOffset = wl.size/2 * TILE_SIZE
        entities.filter(e => e.getComponent(ElementComponent) || e.getComponent(GroundComponent)).forEach(ec => {
            ec.components.filter(c => c?.enabled).forEach(c => {
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

        // Draw the scaled-down canvas
        if (!this.smallCanvas) {
            this.smallCanvas = document.createElement("canvas")
            this.smallCanvas.width = this.smallCanvas.height = this.bigCanvas.width / MiniMap.SCALE
        }
    }

    partiallyRenderDownsampledMap() {
        if (!this.bigCanvas) {
            return
        }

        if (this.lastPixelDrawn.x === this.smallCanvas.width-1 
                && this.lastPixelDrawn.y === this.smallCanvas.height-1) {
            return
        }

        const bigContext = this.bigCanvas.getContext("2d")
        const smallContext = this.smallCanvas.getContext("2d")
        let drawn = 0

        for (let y = this.lastPixelDrawn.y; y < this.smallCanvas.height; y++) {
            const start = y === this.lastPixelDrawn.y ? this.lastPixelDrawn.x : 0
            
            for (let x = start; x < this.smallCanvas.width; x++) {
                const imageData = bigContext.getImageData(
                    x * MiniMap.SCALE, 
                    y * MiniMap.SCALE, 
                    MiniMap.SCALE, 
                    MiniMap.SCALE
                )

                // get the most common color from that square
                const hexStrings = []
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const hex = getHex(imageData.data[i], imageData.data[i+1], imageData.data[2])
                    hexStrings.push(hex)
                    // weigh other colors higher than grass color to show non-nature things on the map
                    if (hex !== Color.TEAL) {
                        hexStrings.push(hex)
                    }
                }
                smallContext.fillStyle = Lists.mode(hexStrings)
                smallContext.fillRect(x, y, 1, 1)

                this.lastPixelDrawn = new Point(x, y)

                drawn++
                if (drawn === MiniMap.PX_PER_UPDATE) {
                    return
                }
            }
        }

        this.fullyRenderedAtLeastOnce = true
    }
    
    getRenderMethods() {
        if (!this.isShowing || !this.fullyRenderedAtLeastOnce) {
            return []
        }

        const padding = 4
         
        return [new ImageRender(
            this.smallCanvas,
            Point.ZERO,
            new Point(this.smallCanvas.width, this.smallCanvas.height),
            new Point(
                padding,
                Camera.instance.dimensions.y - this.smallCanvas.height - padding
            ),
            new Point(this.smallCanvas.width, this.smallCanvas.height),
            UIStateManager.UI_SPRITE_DEPTH,
        )]
    }
}
