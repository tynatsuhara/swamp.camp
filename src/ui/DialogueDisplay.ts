import { Component, Entity, Point, UpdateData } from "brigsby/lib"
import { BasicRenderComponent } from "brigsby/lib/renderer"
import { NineSlice } from "brigsby/lib/sprites"
import {
    DialogueInstance,
    DialogueSource,
    EMPTY_DIALOGUE,
    getDialogue,
    NextDialogue,
} from "../characters/dialogue/Dialogue"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { formatText, formatTextRows, TextAlign, TEXT_SIZE } from "./Text"
import { TextTyper } from "./TextTyper"
import { UIStateManager } from "./UIStateManager"

export class DialogueDisplay extends Component {
    static instance: DialogueDisplay

    private static readonly TEXT_BOX_WIDTH = 288
    private static readonly PADDING = TILE_SIZE
    private static readonly BUTTON_HEIGHT = 19

    private dialogueSource: DialogueSource
    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private optionsEntity: Entity
    private dialogue: DialogueInstance
    private lineIndex: number
    private lines: TextTyper[]
    private optionsPopupTime: number

    get isOpen() {
        return !!this.dialogue
    }
    get source() {
        return this.dialogueSource
    }

    constructor() {
        super()
        DialogueDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.dialogue) {
            return
        }

        // NOTE: We don't allow the user to close dialogue because it might end up in a weird state

        const typer = this.lines[Math.min(this.lineIndex, this.lines.length - 1)]
        const showOptions =
            typer.isFinished &&
            this.dialogue.options.length > 0 &&
            this.lineIndex >= this.lines.length - 1
        const shouldProceed = controls.isMenuClickDown() || controls.isInteractDown()

        const line = typer.update(shouldProceed, updateData.elapsedTimeMillis)

        if (!showOptions && this.lineIndex === this.dialogue.lines.length) {
            this.completeSourceDialogue(this.dialogue.next)
            return
        }

        // Overwrite previously displayed tiles each time
        this.displayEntity = new Entity()
        this.optionsEntity = null

        this.renderNextLine(
            line,
            this.lineIndex >= this.lines.length - 1 ? this.dialogue.options.length : 0
        )

        if (showOptions) {
            this.renderOptions()
        }
    }

    getEntities(): Entity[] {
        if (!this.displayEntity) {
            return [this.e]
        } else {
            return [this.e, this.displayEntity, this.optionsEntity]
        }
    }

    private completeSourceDialogue(nextFn: () => void | NextDialogue) {
        const next = nextFn()

        if (!next) {
            this.dialogueSource.dialogue = EMPTY_DIALOGUE
            this.close()
        } else {
            this.dialogueSource.dialogue = next.dialogue
            if (next.open) {
                this.startDialogue(this.dialogueSource)
            } else {
                this.close()
            }
        }
    }

    close() {
        this.dialogueSource = null
        this.dialogue = null
        this.displayEntity = null
    }

    startDialogue(dialogueSource: DialogueSource) {
        this.dialogueSource = dialogueSource
        this.dialogue = getDialogue(dialogueSource.dialogue)
        this.lineIndex = 0
        this.lines = this.dialogue.lines.map(
            (l, i) =>
                new TextTyper(l, () => {
                    this.lineIndex = Math.min(this.lineIndex + 1, this.lines.length)
                })
        )
        this.optionsPopupTime = Number.MAX_SAFE_INTEGER
    }

    private renderNextLine(line: string, options: number) {
        const topOffset = 2
        const margin = 12
        const width = DialogueDisplay.TEXT_BOX_WIDTH - margin * 2
        const lineSpacing = 4

        const heightOfText =
            formatTextRows(line, width).length * (TEXT_SIZE + lineSpacing) + margin * 2
        const heightOfOptions = options * DialogueDisplay.BUTTON_HEIGHT
        const dimensions = new Point(DialogueDisplay.TEXT_BOX_WIDTH, heightOfText + heightOfOptions)

        const topLeft = new Point(
            Math.floor(Camera.instance.dimensions.x / 2 - dimensions.x / 2),
            Math.floor(Camera.instance.dimensions.y - dimensions.y - DialogueDisplay.PADDING)
        )

        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
            topLeft,
            dimensions
        )

        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const lines = formatText({
            text: line,
            position: topLeft.plus(new Point(margin, topOffset + margin)),
            width,
            alignment: TextAlign.CENTER,
            lineSpacing,
        })

        backgroundTiles.forEach((tile) => this.displayEntity.addComponent(tile))
        this.displayEntity.addComponent(new BasicRenderComponent(...lines))
    }

    private renderOptions() {
        const now = new Date().getTime()
        this.optionsPopupTime = Math.min(this.optionsPopupTime, now)
        // provide some buffer to prevent misclicks
        const canClickTime = this.optionsPopupTime + 350

        const centeredButtonMenuPos = new Point(
            Camera.instance.dimensions.x / 2,
            Camera.instance.dimensions.y -
                DialogueDisplay.PADDING -
                (this.dialogue.options.length * DialogueDisplay.BUTTON_HEIGHT) / 2 -
                11
        )

        this.optionsEntity = ButtonsMenu.render(
            "none",
            this.dialogue.options.map((o) => {
                return {
                    text: o.text,
                    fn: () => {
                        if (now > canClickTime) {
                            this.completeSourceDialogue(o.next)
                        }
                    },
                    buttonColor: "white",
                    textColor: Color.WHITE,
                    hoverColor: Color.RED_2,
                }
            }),
            centeredButtonMenuPos
        )
    }
}
