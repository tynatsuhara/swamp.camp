import { DialogueInstance, getDialogue, NextDialogue, DialogueSource, EMPTY_DIALOGUE } from "../characters/Dialogue"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { NineSlice } from "../../engine/tiles/NineSlice"
import { Point } from "../../engine/Point"
import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextAlign, formatText } from "./Text"
import { Color } from "./Color"
import { Controls } from "../Controls"
import { UIStateManager } from "./UIStateManager"
import { ButtonsMenu } from "./ButtonsMenu"
import { TextTyper } from "./TextTyper"
import { Camera } from "../cutscenes/Camera"

export class DialogueDisplay extends Component {

    static instance: DialogueDisplay

    dialogueSource: DialogueSource
    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private optionsEntity: Entity
    private dialogue: DialogueInstance
    private lineIndex: number
    private lines: TextTyper[]

    get isOpen() { return !!this.dialogue }

    constructor() {
        super()
        DialogueDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.dialogue) {
            return
        }

        // We don't allow the user to close dialogue because it might end up in a weird state
        // if (updateData.input.isKeyDown(Controls.closeButton)) {
        //     this.close()
        //     return
        // }
        
        const typer = this.lines[Math.min(this.lineIndex, this.lines.length-1)]
        const showOptions = typer.isFinished && this.dialogue.options.length > 0 && this.lineIndex >= this.lines.length-1
        const shouldProceed = updateData.input.isMouseDown || updateData.input.isKeyDown(Controls.interactButton)
                        
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

    private completeSourceDialogue(nextFn: () => void|NextDialogue) {
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
        this.lines = this.dialogue.lines.map((l, i) => new TextTyper(l, () => {
            this.lineIndex = Math.min(this.lineIndex + 1, this.lines.length)
        }))
    }

    private renderNextLine(line: string) {
        const dimensions = new Point(288, 83)
        const bottomBuffer = TILE_SIZE
        const screenDimensions = Camera.instance.dimensions
        const topLeft = new Point(
            Math.floor(screenDimensions.x/2 - dimensions.x/2),
            Math.floor(screenDimensions.y - dimensions.y - bottomBuffer)
        )

        const backgroundTiles = NineSlice.makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            topLeft,
            dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const topOffset = 2
        const margin = 12
        const width = dimensions.x - margin*2

        const lines = formatText(
            line, 
            Color.DARK_RED,
            topLeft.plus(new Point(margin, topOffset + margin)),
            width, 
            TextAlign.CENTER
        )
        lines.forEach(fr => fr.depth = UIStateManager.UI_SPRITE_DEPTH + 1)

        backgroundTiles.forEach(tile => this.displayEntity.addComponent(tile))
        this.displayEntity.addComponent(new BasicRenderComponent(...lines))
    }

    private renderOptions() {
        this.optionsEntity = ButtonsMenu.render(
            Camera.instance.dimensions,
            "white",
            this.dialogue.options.map(o => { 
                return {
                    text: o.text, 
                    fn: () => this.completeSourceDialogue(o.next),
                    buttonColor: 'white',
                    textColor: Color.WHITE,
                    hoverColor: Color.DARK_RED
                }
            })
        )
    }
}