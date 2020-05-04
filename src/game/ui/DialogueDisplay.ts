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

export class DialogueDisplay extends Component {

    static instance: DialogueDisplay

    private e: Entity = new Entity([this])
    private displayEntity: Entity
    private dialogue: DialogueInstance
    private lineIndex: number
    get isOpen() { return !!this.dialogue }

    constructor() {
        super()
        DialogueDisplay.instance = this
    }

    update(updateData: UpdateData) {
        if (!this.dialogue) {
            return
        }

        if (updateData.input.isMouseDown) {
            this.lineIndex++
        }

        if (this.lineIndex === this.dialogue.lines.length) {
            this.dialogue = null
            this.displayEntity = null
            return
        }

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
        ).map(c => c as Component)

        const topOffset = 2
        const margin = 12
        const width = dimensions.x*TILE_SIZE - margin*2
        const lineSpacing = 4

        const textComponents = formatText(
            this.dialogue.lines[this.lineIndex], 
            Color.DARK_RED,
            topLeft.plus(new Point(margin, topOffset + margin)),
            width, 
            TextAlign.CENTER
        ).map(render => new BasicRenderComponent(render))

        this.displayEntity = new Entity(backgroundTiles.concat(textComponents))
    }
}