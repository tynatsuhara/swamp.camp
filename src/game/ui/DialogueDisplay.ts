import { DialogueInstance, getDialogue, NextDialogue, Dialogue } from "../characters/Dialogue"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { makeStretchedNineSliceComponents } from "../../engine/tiles/NineSlice"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextAlign, formatText, TEXT_PIXEL_WIDTH } from "./Text"
import { Color } from "./Color"
import { Controls } from "../Controls"
import { UIStateManager } from "./UIStateManager"
import { TextButton } from "./TextButton"
import { Dude } from "../characters/Dude"
import { ButtonsMenu } from "./ButtonsMenu"

export class DialogueDisplay extends Component {

    static instance: DialogueDisplay

    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private optionsEntity: Entity
    private dude: Dude
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

        if (updateData.input.isKeyDown(Controls.closeButton)) {
            this.close()
            return
        }

        const showOptions = this.dialogue.options.length > 0 && this.lineIndex === this.dialogue.lines.length-1

        if (this.letterTicker !== 0 && (updateData.input.isMouseDown || updateData.input.isKeyDown(Controls.interactButton))) {
            if (this.finishedPrinting) {
                // go to the next dialogue line
                if (!showOptions) {
                    this.lineIndex++
                    this.letterTicker = 0
                    this.finishedPrinting = false
                }
            } else {
                // fast-forward the letter printing
                this.letterTicker += 3.6e+6  // hack to finish printing, presumably there won't be an hour of text
            }
        }

        if (this.lineIndex === this.dialogue.lines.length) {
            this.completeDudeDialogue(this.dialogue.next)
            return
        }

        this.letterTicker += updateData.elapsedTimeMillis

        // Overwrite previously displayed tiles each time
        this.displayEntity = new Entity()
        this.optionsEntity = null

        this.renderNextLine(updateData.dimensions)

        if (showOptions && this.finishedPrinting) {
            this.renderOptions(updateData.dimensions)
        }
    }

    getEntities(): Entity[] {
        if (!this.displayEntity) {
            return [this.e]
        } else {
            return [this.e, this.displayEntity, this.optionsEntity]
        }
    }

    private completeDudeDialogue(nextFn: () => void|NextDialogue) {
        const next = nextFn()
        
        if (!next) {
            this.dude.dialogue = Dialogue.NONE
            this.close()
        } else {
            this.dude.dialogue = next.dialogue
            if (next.open) {
                this.startDialogue(this.dude)
            } else {
                this.close()
            }
        }
    }

    close() {
        this.dialogue = null
        this.displayEntity = null
    }

    startDialogue(dude: Dude) {
        this.dude = dude
        this.dialogue = getDialogue(dude.dialogue)
        this.lineIndex = 0
        this.letterTicker = 0
        this.finishedPrinting = false
    }

    private renderNextLine(screenDimensions: Point) {
        const dimensions = new Point(288, 83)
        const bottomBuffer = TILE_SIZE
        const topLeft = new Point(
            Math.floor(screenDimensions.x/2 - dimensions.x/2),
            Math.floor(screenDimensions.y - dimensions.y - bottomBuffer)
        )

        const backgroundTiles = makeStretchedNineSliceComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            topLeft,
            dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const topOffset = 2
        const margin = 12
        const width = dimensions.x - margin*2


        const formattedRenders = formatText(
            this.dialogue.lines[this.lineIndex], 
            Color.DARK_RED,
            topLeft.plus(new Point(margin, topOffset + margin)),
            width, 
            TextAlign.CENTER
        )
        formattedRenders.forEach(fr => fr.depth = UIStateManager.UI_SPRITE_DEPTH + 1)

        // "type" out the letters
        if (!this.finishedPrinting) {
            const millisPerCharacter = 35
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
        }

        backgroundTiles.forEach(tile => this.displayEntity.addComponent(tile))
        this.displayEntity.addComponent(new BasicRenderComponent(...formattedRenders))
    }

    private renderOptions(screenDimensions: Point) {
        this.optionsEntity = ButtonsMenu.render(
            screenDimensions,
            "white",
            this.dialogue.options.map(o => { 
                return {
                    text: o.text, 
                    fn: () => o.next(),
                    buttonColor: 'white',
                    textColor: Color.WHITE,
                    hoverColor: Color.DARK_RED
                }
            })
        )
    }
}