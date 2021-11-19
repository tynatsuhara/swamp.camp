import { Component } from "brigsby/dist/Component"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { Tilesets } from "../graphics/Tilesets"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Point } from "brigsby/dist/Point"
import { TextRender } from "brigsby/dist/renderer/TextRender"

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
            return Tilesets.instance.oneBit
                .getTileSource(c)
                .toImageRender(new SpriteTransform(this.topLeftPos.plus(new Point(10 * i, 0))))
        })
    }

    clear() {
        this.say("")
    }

    getRenderMethods(): RenderMethod[] {
        return this.tiles
    }
}
