import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { RectRender } from "brigsby/dist/renderer/RectRender"
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

    static readonly VERTICAL_MARGIN = 56
    // the bottom of any icons should line up with this Y coordinate
    static readonly TOP_BORDER = TextOverlayManager.VERTICAL_MARGIN - TILE_SIZE
    static readonly DEPTH = Number.MAX_SAFE_INTEGER / 2 + 11_000

    private text: TextTyper[]
    private finishAction: string
    private onFinish: () => void
    private additionalComponents: (index: number) => Component[]
    private textAlign: TextAlign
    private pauseBackground: boolean

    private index = 0
    private firstFrame = false // prevent clicking "next" immediately

    get isActive() {
        return !!this.onFinish
    }

    get shouldPauseBackground() {
        return this.pauseBackground
    }

    /**
     * @param text click-through displayed text, can include newlines
     * @param onFinish called after the clicking through the last string in the text array
     * @param pauseBackground whether or not to continue updating game scene components (dudes, elements, etc)
     */
    open({
        text,
        finishAction,
        onFinish = () => {},
        additionalComponents = () => [],
        textAlign = TextAlign.LEFT,
        pauseBackground = true,
    }: {
        text: string[]
        finishAction: string
        onFinish?: () => void
        additionalComponents?: (index: number) => Component[]
        textAlign?: TextAlign
        pauseBackground?: boolean
    }) {
        this.index = 0
        this.text = text.map((t) => new TextTyper(t, () => this.nextLine()))
        this.finishAction = finishAction
        this.onFinish = onFinish
        this.additionalComponents = additionalComponents
        this.textAlign = textAlign
        this.pauseBackground = pauseBackground

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
        const typedText = this.text[this.index]?.getText() ?? ""

        this.firstFrame = false

        const topLeft = new Point(
            updateData.dimensions.x / 2 - TextOverlayManager.WIDTH / 2,
            TextOverlayManager.VERTICAL_MARGIN
        )

        const buttonEdgeMargin = 24

        this.getRenderMethods = () => {
            const mouseIconPos = new Point(
                updateData.dimensions.x - buttonEdgeMargin,
                updateData.dimensions.y - buttonEdgeMargin
            )
            const action =
                this.index >= this.text.length - 1 && Lists.last(this.text).isFinished
                    ? this.finishAction
                    : "..."

            return [
                // background
                new RectRender({
                    dimensions: updateData.dimensions,
                    color: Color.BLACK + "EE", // slightly transparent for cases where the background isn't paused
                    depth: TextOverlayManager.DEPTH - 1,
                }),
                ...formatText({
                    text: typedText,
                    color: Color.WHITE,
                    position: topLeft,
                    width: TextOverlayManager.WIDTH,
                    alignment: this.textAlign,
                    depth: TextOverlayManager.DEPTH,
                }),
                ...formatText({
                    text: action,
                    color: Color.WHITE,
                    position: mouseIconPos.plus(new Point(-TEXT_PIXEL_WIDTH * action.length, 4)),
                    width: TextOverlayManager.WIDTH,
                    depth: TextOverlayManager.DEPTH,
                }),
                Tilesets.instance.oneBit
                    .getTileSource(controls.isGamepadMode() ? "gamepad-x" : "leftClick")
                    .toImageRender(
                        SpriteTransform.new({
                            position: mouseIconPos,
                            depth: TextOverlayManager.DEPTH,
                        })
                    ),
            ]
        }
    }

    getEntity() {
        return new Entity([this, ...this.additionalComponents(this.index)])
    }
}
