import { DialogueInstance, Dialogue, getDialogue } from "../characters/Dialogue"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { makeNineSliceTileComponents } from "../../engine/tiles/NineSlice"
import { Point } from "../../engine/point"
import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_FONT, TEXT_SIZE, TextAlign, formatText, TEXT_PIXEL_WIDTH } from "./Text"
import { Color } from "./Color"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { Controls } from "../Controls"
import { UIStateManager } from "./UIStateManager"
import { TextButton } from "./TextButton"
import { Dude } from "../characters/Dude"

export class DialogueDisplay extends Component {

    static instance: DialogueDisplay

    private e: Entity = new Entity([this])
    private displayEntity: Entity
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

        const showOptions = this.dialogue.options.length > 0 && this.lineIndex === this.dialogue.lines.length-1

        if (this.letterTicker !== 0 && (updateData.input.isMouseDown || Controls.interact(updateData.input))) {
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
            this.close()
            this.dude.dialogue = null
            return
        }

        this.letterTicker += updateData.elapsedTimeMillis

        // Overwrite previously displayed tiles each time
        this.displayEntity = new Entity()

        this.renderNextLine(updateData.dimensions)

        if (showOptions && this.finishedPrinting) {
            this.renderOptions(updateData.dimensions)
        }
    }

    getEntities(): Entity[] {
        if (!this.displayEntity) {
            return [this.e]
        } else {
            return [this.e, this.displayEntity]
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
        const dimensions = new Point(18, 5)
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

    // TODO make this UI not bad
    private renderOptions(screenDimensions: Point) {
        const options = this.dialogue.options
        const longestOption = Math.max(...options.map(o => o[0].length))

        const tilesWide = Math.ceil(longestOption * TEXT_PIXEL_WIDTH/TILE_SIZE)

        // TODO determine dimensions from string lengths
        const dimensions = new Point(tilesWide + 2, options.length + 1)
        
        const topLeft = screenDimensions.div(2).minus(dimensions.times(TILE_SIZE).div(2))

        const backgroundTiles = makeNineSliceTileComponents(
            Tilesets.instance.outdoorTiles.getNineSlice("dialogueBG"), 
            topLeft,
            dimensions
        )
        backgroundTiles[0].transform.depth = UIStateManager.UI_SPRITE_DEPTH

        const topOffset = 2
        const margin = 12
        const width = dimensions.x*TILE_SIZE - margin*2

        backgroundTiles.forEach(tile => this.displayEntity.addComponent(tile))

        options.forEach((option, i) => this.displayEntity.addComponent(
            new TextButton(
                topLeft.plus(new Point(dimensions.x + (dimensions.x-width)/2, i * (TILE_SIZE + 2))),
                option[0],
                () => {
                    const buttonFnResult = option[1]()
                    if (!!buttonFnResult) {
                        this.dude.dialogue = buttonFnResult
                        this.startDialogue(this.dude)
                    } else {
                        this.dude.dialogue = null
                        this.close()
                    }
                }
            )
        ))
    }
}