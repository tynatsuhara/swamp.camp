import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { formatText } from "../ui/Text"
import { TextTyper } from "../ui/TextTyper"

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
    private text: TextTyper[]
    private onFinish: () => void
    private additionalComponents: Component[] = []
    private firstFrame = false  // prevent clicking "next" immediately

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
        this.text = text.map(t => new TextTyper(t, () => this.nextLine()))
        this.onFinish = onFinish
        this.additionalComponents = additionalComponents
        this.firstFrame = true
    }

    nextLine() {
        this.index++
        if (this.index === this.text.length) {
            // disable
            this.onFinish()
            this.onFinish = null
        }
    }

    update(updateData: UpdateData) {
        if (!this.isActive) {
            return
        }

        const text = this.text[this.index]
        const typedText = text.update(
            !this.firstFrame && updateData.input.isMouseDown,
            updateData.elapsedTimeMillis
        )

        this.firstFrame = false
        
        const topLeft = new Point(
            updateData.dimensions.x/2 - TextOverlayManager.WIDTH/2, 
            TextOverlayManager.VERTICAL_MARGIN
        )

        this.getRenderMethods = () => {
            const clickColor = updateData.input.isMouseHeld ? Color.TAN : Color.WHITE
            const mouseIconPos = new Point(
                updateData.dimensions.x - (updateData.dimensions.x - TextOverlayManager.WIDTH)/2 - TILE_SIZE,
                updateData.dimensions.y - TextOverlayManager.VERTICAL_MARGIN
            )
            return [
                ...formatText(
                    typedText, 
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