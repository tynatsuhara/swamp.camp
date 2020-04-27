import { Component } from "../../engine/component"
import { makeNineSliceTileComponents } from "../../engine/tiles/NineSlice"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Tilesets, TILE_SIZE } from "../graphics/Tilesets"
import { Point } from "../../engine/point"
import { TextRender } from "../../engine/renderer/TextRender"
import { TEXT_STYLE, TEXT_PIXEL_HEIGHT, TEXT_PIXEL_WIDTH } from "./Text"
import { UpdateData } from "../../engine/engine"
import { Color } from "./Color"
import { TileTransform } from "../../engine/tiles/TileTransform"

export class TextBox extends Component {
    
    position: Point = new Point(0, 0)

    private static readonly margin = 4
    private static readonly textOffset = new Point(TextBox.margin, 12)
    private text: string
    private tiles: TileComponent[]

    constructor(text: string) {
        super()

        this.text = text

        this.start = () => {
            this.tiles = [this.entity.addComponent(
                Tilesets.instance.oneBit.getTileSource("textBoxCenter").toComponent()
            )]

            // this.tiles = makeNineSliceTileComponents(
            //     Tilesets.instance.oneBit.getNineSlice("textBoxNW"), 
            //     pos,
            //     dimensions
            // )
            // this.tiles.forEach(t => this.entity.addComponent(t))
            
            this.tiles[0].transform.depth = 100000
        }
    }

    say(text: string) {
        this.text = text
    }

    clear() {
        this.text = null
    }

    update(updateData: UpdateData) {
        this.tiles[0].enabled = this.text !== null
        if (this.text === null) {
            return
        }
        
        const width = this.text.length * 8  // this will break if we change ZOOM or text size
        this.tiles[0].transform.dimensions = new Point(width + TextBox.margin * 2, TILE_SIZE)

        this.tiles[0].transform.position = this.position.plus(new Point(TILE_SIZE/2, -TILE_SIZE)).apply(Math.floor)
    }

    getRenderMethods() {
        if (this.text === null) {
            return []
        }
        return [new TextRender(
            this.text,
            this.tiles[0].transform.position.plus(TextBox.textOffset),
            TEXT_STYLE,
            Color.DARK_RED,
        )]
    }
}