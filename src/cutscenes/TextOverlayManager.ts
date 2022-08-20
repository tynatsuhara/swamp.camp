import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { controls } from "../Controls"
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

    static readonly VERTICAL_MARGIN = 72
    // the bottom of any icons should line up with this Y coordinate
    static readonly TOP_BORDER = TextOverlayManager.VERTICAL_MARGIN - TILE_SIZE

    private text: TextTyper[]
    private finishAction: string
    private onFinish: () => void
    private additionalComponents: (index: number) => Component[]
    private textAlign: TextAlign

    private index = 0
    private firstFrame = false // prevent clicking "next" immediately

    get isActive() {
        return !!this.onFinish
    }

    /**
     * @param text click-through displayed text, can include newlines
     * @param onFinish called after the clicking through the last string in the text array
     * @param additionalComponents
     */
    open({
        text,
        finishAction,
        onFinish = () => {},
        additionalComponents = () => [],
        textAlign = TextAlign.LEFT,
    }: {
        text: string[]
        finishAction: string
        onFinish?: () => void
        additionalComponents?: (index: number) => Component[]
        textAlign?: TextAlign
    }) {
        this.index = 0
        this.text = text.map((t) => new TextTyper(t, () => this.nextLine()))
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

        this.text[this.index].update(
            !this.firstFrame && controls.isMenuClickDown(),
            updateData.elapsedTimeMillis
        )
        const typedText = this.text[this.index].getText()

        this.firstFrame = false

        const topLeft = new Point(
            updateData.dimensions.x / 2 - TextOverlayManager.WIDTH / 2,
            TextOverlayManager.VERTICAL_MARGIN
        )

        this.getRenderMethods = () => {
            const mouseIconPos = new Point(
                updateData.dimensions.x -
                    (updateData.dimensions.x - TextOverlayManager.WIDTH) / 2 -
                    TILE_SIZE,
                updateData.dimensions.y - TextOverlayManager.VERTICAL_MARGIN
            )
            const action =
                this.index >= this.text.length - 1 && Lists.last(this.text).isFinished
                    ? this.finishAction
                    : "..."
            return [
                ...formatText({
                    text: typedText,
                    color: Color.WHITE,
                    position: topLeft,
                    width: TextOverlayManager.WIDTH,
                    alignment: this.textAlign,
                }),
                ...formatText({
                    text: action,
                    color: Color.WHITE,
                    position: mouseIconPos.plus(new Point(-TEXT_PIXEL_WIDTH * action.length, 4)),
                    width: TextOverlayManager.WIDTH,
                }),
                Tilesets.instance.oneBit
                    .getTileSource(controls.isGamepadMode() ? "gamepad-x" : "leftClick")
                    .toImageRender(new SpriteTransform(mouseIconPos)),
            ]
        }
    }

    getEntity() {
        return new Entity([this, ...this.additionalComponents(this.index)])
    }
}
