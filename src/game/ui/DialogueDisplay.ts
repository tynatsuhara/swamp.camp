import { DialogueInstance, Dialogue, getDialogue } from "../characters/Dialogue"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { makeNineSliceTileComponents } from "../../engine/tiles/NineSlice"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_FONT, TEXT_SIZE, TextAlign, formatText } from "./Text"
import { Color } from "./Color"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { Controls } from "../Controls"
import { UIStateManager } from "./UIStateManager"

export class DialogueDisplay extends Component {

    static instance: DialogueDisplay

    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private dialogue: DialogueInstance
    private lineIndex: number

    private letterTicker: number
    private finishedPrinting: boolean

    get isOpen() { return !!this.dialogue }

    constructor() {
        super()
        DialogueDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.dialogue) {
            return
        }

        if (this.letterTicker !== 0 && (updateData.input.isMouseDown || Controls.interact(updateData.input))) {
            if (this.finishedPrinting) {
                this.lineIndex++
                this.letterTicker = 0
                this.finishedPrinting = false
            } else {
                this.letterTicker += 3.6e+6  // hack to finish printing, presumably there won't be an hours worth of text
            }
        }

        if (this.lineIndex === this.dialogue.lines.length) {
            this.dialogue = null
            this.displayEntity = null
            return
        }

        this.letterTicker += updateData.elapsedTimeMillis

        this.renderNextLine(updateData.dimensions)
    }

    getEntities(): Entity[] {
        if (!this.displayEntity) {
            return [this.e]
        } else {
            return [this.e, this.displayEntity]
        }
    }

    startDialogue(dialogue: Dialogue) {
        this.dialogue = getDialogue(dialogue)
        this.lineIndex = 0
        this.letterTicker = 0
        this.finishedPrinting = false
    }

    private renderNextLine(screenDimensions: Point) {
        const dimensions = new Point(14, 5)
        const bottomBuffer = TILE_SIZE
        const topLeft = new Point(
            Math.floor(screenDimensions.x/2 - dimensions.x/2*TILE_SIZE),
            Math.floor(screenDimensions.y - dimensions.y*TILE_SIZE - bottomBuffer)
        )

        const backgroundTiles = makeNineSliceTileComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            topLeft,
            dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const topOffset = 2
        const margin = 12
        const width = dimensions.x*TILE_SIZE - margin*2

        const millisPerCharacter = 35

        const formattedRenders = formatText(
            this.dialogue.lines[this.lineIndex], 
            Color.DARK_RED,
            topLeft.plus(new Point(margin, topOffset + margin)),
            width, 
            TextAlign.CENTER
        )
        formattedRenders.forEach(fr => fr.depth = UIStateManager.UI_SPRITE_DEPTH + 1)

        // "type" out the letters
        let charactersToShow = Math.floor(this.letterTicker/millisPerCharacter)
        for (let i = 0; i < formattedRenders.length; i++) {
            const fr = formattedRenders[i]
            let newStr = ""
            for (let j = 0; j < fr.text.length; j++) {
                if (charactersToShow === 0) {
                    break
                }
                newStr += fr.text.charAt(j)
                if (fr.text.charAt(j) !== ' ') {
                    charactersToShow--
                }
                if (j === fr.text.length-1 && i === formattedRenders.length-1) {
                    this.finishedPrinting = true
                }
            }
            fr.text = newStr
        }

        const textComponent = new BasicRenderComponent(...formattedRenders)

        this.displayEntity = new Entity((backgroundTiles as Component[]).concat([textComponent]))
    }
}