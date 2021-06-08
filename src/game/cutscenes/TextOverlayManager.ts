import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { formatText } from "../ui/Text"

export class TextOverlayManager extends Component {

    private static _instance: TextOverlayManager
    static get instance(): TextOverlayManager {
        if (!this._instance) {
            this._instance = new TextOverlayManager()
        }
        return this._instance
    }

    private static readonly WIDTH = 240
    static readonly VERTICAL_MARGIN = 96

    private index = 0
    private text: string[]
    private onFinish: () => void
    private additionalComponents: Component[] = []
    private clicking = false

    get isActive() {
        return !!this.onFinish
    }

    /**
     * @param text click-through displayed text, can include newlines
     * @param onFinish called after the clicking through the last string in the text array
     * @param additionalComponents 
     */
    enable(text: string[], onFinish: () => void, additionalComponents: Component[] = []) {
        this.index = 0
        this.text = text
        this.onFinish = onFinish
        this.additionalComponents = additionalComponents
    }

    disable() {
        this.onFinish = null
    }

    update(updateData: UpdateData) {
        if (!this.isActive) {
            return
        }
        
        if (updateData.input.isMouseUp && this.clicking) {
            if (this.index+1 === this.text.length) {
                this.clicking = false
                this.onFinish()
                this.disable()
                return
            }
            this.clicking = false
            this.index++
        } else if (updateData.input.isMouseDown) {
            this.clicking = true
        }        

        const topLeft = new Point(
            updateData.dimensions.x/2 - TextOverlayManager.WIDTH/2, 
            TextOverlayManager.VERTICAL_MARGIN
        )

        this.getRenderMethods = () => {
            const clickColor = this.clicking ? Color.TAN : Color.WHITE
            const mouseIconPos = new Point(
                updateData.dimensions.x - (updateData.dimensions.x - TextOverlayManager.WIDTH)/2 - TILE_SIZE,
                updateData.dimensions.y - TextOverlayManager.VERTICAL_MARGIN
            )
            return [
                ...formatText(
                    this.text[this.index], 
                    Color.WHITE, 
                    topLeft, 
                    TextOverlayManager.WIDTH
                ),
                ...formatText(
                    "NEXT", 
                    clickColor, 
                    mouseIconPos.plus(new Point(-33, 4)), 
                    TextOverlayManager.WIDTH, 
                ),
                Tilesets.instance.oneBit.getTileSource("leftClick")
                    .filtered(ImageFilters.tint(clickColor))
                    .toImageRender(new TileTransform(mouseIconPos))
            ]
        }
    }

    getEntity() {
        return new Entity([this, ...this.additionalComponents])
    }
}