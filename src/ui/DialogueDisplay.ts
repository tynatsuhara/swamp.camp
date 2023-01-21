import { Component, Entity, Point, UpdateData } from "brigsby/dist"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { NineSlice } from "brigsby/dist/sprites"
import { startTalkingSounds, stopTalkingSounds } from "../audio/Talking"
import {
    DialogueInstance,
    DialogueSource,
    EMPTY_DIALOGUE,
    getDialogue,
    NextDialogue,
} from "../characters/dialogue/Dialogue"
import { Dude } from "../characters/Dude"
import { controls } from "../Controls"
import { Camera } from "../cutscenes/Camera"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { ButtonsMenu } from "./ButtonsMenu"
import { Color } from "./Color"
import { formatText, formatTextRows, TextAlign, TEXT_SIZE } from "./Text"
import { TextTyper } from "./TextTyper"
import { UIStateManager } from "./UIStateManager"

export class DialogueDisplay extends Component {
    static get instance() {
        return Singletons.getOrCreate(DialogueDisplay)
    }

    private static readonly TEXT_BOX_WIDTH = 288
    private static readonly PADDING = TILE_SIZE
    private static readonly BUTTON_HEIGHT = 19

    private dialogueSource: DialogueSource
    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private optionsEntity: Entity
    private dialogue: DialogueInstance
    private lineIndex: number
    private lineTypers: TextTyper[]
    private optionsPopupTime: number

    get isOpen() {
        return !!this.dialogue
    }
    get source() {
        return this.dialogueSource
    }

    lateUpdate(updateData: UpdateData) {
        if (!this.dialogue) {
            return
        }

        if (controls.isCloseMenuButtonDown()) {
            this.close()
            return
        }

        // NOTE: We don't allow the user to close dialogue because it might end up in a weird state

        const skipButtonClick = controls.isMenuClickDown() || controls.isInteractDown()

        const wasFinishedBeforeUpdate = this.lineTypers[this.lineIndex]?.isFinished
        this.lineTypers[this.lineIndex]?.update(skipButtonClick, updateData.elapsedTimeMillis)
        const line = this.lineTypers[this.lineIndex]?.getText()

        const showOptions =
            this.lineTypers.length === 0 ||
            (this.lineTypers[this.lineIndex].isFinished &&
                this.dialogue.options.length > 0 &&
                this.lineIndex === this.lineTypers.length - 1)

        if (
            !showOptions &&
            this.lineIndex === this.dialogue.lines.length - 1 &&
            this.lineTypers[this.lineIndex].isFinished &&
            skipButtonClick &&
            wasFinishedBeforeUpdate
        ) {
            this.completeSourceDialogue(this.dialogue.next)
            return
        }

        // Overwrite previously displayed tiles each time
        this.displayEntity = new Entity()
        this.optionsEntity = null

        this.renderNextLine(
            line,
            // allocate space for options even if showOptions=false (>= to account for no-typers case)
            this.lineIndex >= this.lineTypers.length - 1 ? this.dialogue.options.length : 0
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
            if (next.open) {
                // When a dialogue doesn't terminate (isOpen=false), we don't update the dialogueSource
                this.startDialogueInternal(this.dialogueSource, next.dialogue)
            } else {
                this.dialogueSource.dialogue = next.dialogue
                this.close()
            }
        }
    }

    close() {
        stopTalkingSounds()
        this.dialogueSource = null
        this.dialogue = null
        this.displayEntity = null
    }

    startDialogue(dialogueSource: DialogueSource) {
        this.startDialogueInternal(dialogueSource)
    }

    private startDialogueInternal(dialogueSource: DialogueSource, dialogueOverride?: string) {
        this.dialogueSource = dialogueSource
        this.dialogue = getDialogue(dialogueOverride ?? dialogueSource.dialogue)

        // redirect case
        if (!this.dialogue.lines) {
            this.completeSourceDialogue(this.dialogue.next)
            return
        }

        this.lineIndex = 0

        this.lineTypers = this.dialogue.lines.map(
            (l, i) =>
                new TextTyper(
                    l,
                    () => {
                        if (this.lineIndex <= this.lineTypers.length && !l.startsWith("*")) {
                        }
                        this.lineIndex = Math.min(this.lineIndex + 1, this.lineTypers.length - 1)
                    },
                    () => {
                        if (!l.startsWith("*") && dialogueSource instanceof Dude) {
                            startTalkingSounds(this.dialogue.lines[this.lineIndex].length)
                        }
                    }
                )
        )
        this.optionsPopupTime = Number.MAX_SAFE_INTEGER
    }

    private renderNextLine(line: string, options: number) {
        const margin = 12
        const width = DialogueDisplay.TEXT_BOX_WIDTH - margin * 2
        const lineSpacing = 4

        const textRows = !line ? 0 : formatTextRows(line, width).length
        const topOffset = textRows > 0 ? 2 : 0
        const optionsPadding = textRows > 0 && options > 0 ? 2 : 0

        const heightOfText = textRows * (TEXT_SIZE + lineSpacing) + margin * 2 + optionsPadding
        const heightOfOptions = options * DialogueDisplay.BUTTON_HEIGHT
        const dimensions = new Point(DialogueDisplay.TEXT_BOX_WIDTH, heightOfText + heightOfOptions)

        const topLeft = new Point(
            Math.floor(Camera.instance.dimensions.x / 2 - dimensions.x / 2),
            Math.floor(Camera.instance.dimensions.y - dimensions.y - DialogueDisplay.PADDING)
        )

        NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
            dimensions,
            { position: topLeft, depth: UIStateManager.UI_SPRITE_DEPTH }
        ).sprites.forEach((tile) => this.displayEntity.addComponent(tile))

        if (textRows > 0) {
            const lines = formatText({
                text: line,
                position: topLeft.plus(new Point(margin, topOffset + margin)),
                width,
                alignment: TextAlign.CENTER,
                lineSpacing,
            })
            this.displayEntity.addComponent(new BasicRenderComponent(...lines))
        }
    }

    private renderOptions() {
        const now = Date.now()
        this.optionsPopupTime = Math.min(this.optionsPopupTime, now)
        // provide some buffer to prevent misclicks
        const canClickTime = this.optionsPopupTime + 350

        const centeredButtonMenuPos = new Point(
            Camera.instance.dimensions.x / 2,
            Camera.instance.dimensions.y -
                DialogueDisplay.PADDING -
                (this.dialogue.options.length * DialogueDisplay.BUTTON_HEIGHT) / 2 -
                12
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
