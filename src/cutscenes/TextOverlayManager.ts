import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Lists } from "brigsby/dist/util/Lists"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { Color } from "../ui/Color"
import { formatText, TextAlign, TEXT_PIXEL_WIDTH } from "../ui/Text"
import { TextTyper } from "../ui/TextTyper"

export class TextOverlayManager extends Component {

    static get instance() {
        return Singletons.getOrCreate(TextOverlayManager)
    }

    private static readonly WIDTH = 240
    private static readonly VERTICAL_MARGIN = 88
    // the bottom of any icons should line up with this Y coordinate
    static readonly TOP_BORDER = TextOverlayManager.VERTICAL_MARGIN - TILE_SIZE

    private text: TextTyper[]
    private finishAction: string
    private onFinish: () => void
    private additionalComponents: Component[] = []
    private textAlign: TextAlign

    private index = 0
    private firstFrame = false  // prevent clicking "next" immediately

    get isActive() {
        return !!this.onFinish
    }

    /**
     * @param text click-through displayed text, can include newlines
     * @param onFinish called after the clicking through the last string in the text array
     * @param additionalComponents 
     */
    enable(
        text: string[], 
        finishAction: string, 
        onFinish: () => void, 
        additionalComponents: Component[] = [],
        textAlign: TextAlign = TextAlign.LEFT,
    ) {
        this.index = 0
        this.text = text.map(t => new TextTyper(t, () => this.nextLine()))
        this.finishAction = finishAction
        this.onFinish = onFinish
        this.additionalComponents = additionalComponents
        this.textAlign = textAlign

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
            const mouseIconPos = new Point(
                updateData.dimensions.x - (updateData.dimensions.x - TextOverlayManager.WIDTH)/2 - TILE_SIZE,
                updateData.dimensions.y - TextOverlayManager.VERTICAL_MARGIN
            )
            const action = this.index >= this.text.length-1 
                    && Lists.last(this.text).isFinished 
                            ? this.finishAction 
                            : "NEXT"
            return [
                ...formatText(
                    typedText, 
                    Color.WHITE, 
                    topLeft, 
                    TextOverlayManager.WIDTH,
                    this.textAlign,
                ),
                ...formatText(
                    action, 
                    Color.WHITE, 
                    mouseIconPos.plus(new Point(-TEXT_PIXEL_WIDTH * action.length, 4)), 
                    TextOverlayManager.WIDTH, 
                ),
                Tilesets.instance.oneBit.getTileSource("leftClick").toImageRender(new SpriteTransform(mouseIconPos))
            ]
        }
    }

    getEntity() {
        return new Entity([this, ...this.additionalComponents])
    }
}