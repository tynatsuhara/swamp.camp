import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { NineSlice } from "brigsby/dist/sprites/NineSlice"
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
import { formatText, TextAlign } from "./Text"
import { TextTyper } from "./TextTyper"
import { UIStateManager } from "./UIStateManager"

export class DialogueDisplay extends Component {
    static instance: DialogueDisplay

    private static readonly TEXT_BOX_DIMENSIONS = new Point(288, 83)
    private static readonly PADDING = TILE_SIZE

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

        this.renderNextLine(line)

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

    private renderNextLine(line: string) {
        const screenDimensions = Camera.instance.dimensions
        const topLeft = new Point(
            Math.floor(screenDimensions.x / 2 - DialogueDisplay.TEXT_BOX_DIMENSIONS.x / 2),
            Math.floor(
                screenDimensions.y - DialogueDisplay.TEXT_BOX_DIMENSIONS.y - DialogueDisplay.PADDING
            )
        )

        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"),
            topLeft,
            DialogueDisplay.TEXT_BOX_DIMENSIONS
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const topOffset = 2
        const margin = 12
        const width = DialogueDisplay.TEXT_BOX_DIMENSIONS.x - margin * 2

        const lines = formatText({
            text: line,
            position: topLeft.plus(new Point(margin, topOffset + margin)),
            width,
            alignment: TextAlign.CENTER,
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
            DialogueDisplay.PADDING +
                (Camera.instance.dimensions.y -
                    DialogueDisplay.TEXT_BOX_DIMENSIONS.y -
                    DialogueDisplay.PADDING) /
                    2
        )

        this.optionsEntity = ButtonsMenu.render(
            "white",
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
                    hoverColor: Color.DARK_RED,
                }
            }),
            centeredButtonMenuPos
        )
    }
}
