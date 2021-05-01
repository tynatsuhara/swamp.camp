import { Component } from "../../engine/Component"
import { RenderMethod } from "../../engine/renderer/RenderMethod"
import { Tilesets } from "../graphics/Tilesets"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Point } from "../../engine/Point"
import { TextRender } from "../../engine/renderer/TextRender"

export class StringTiles extends Component {

    private topLeftPos: Point
    private tiles: RenderMethod[] = []

    constructor(position: Point) {
        super()
        this.topLeftPos = position
    }

    say(s: string) {
        if (s.length === 0) {
            this.tiles = []
            return
        }
        this.tiles = Array.from(s).map((c, i) => {
            return Tilesets.instance.oneBit.getTileSource(c).toImageRender(
                new TileTransform(this.topLeftPos.plus(new Point(10 * i, 0)))
            )
        })
    }

    clear() {
        this.say("")
    }
    
    getRenderMethods(): RenderMethod[] {
        return this.tiles
    }
}