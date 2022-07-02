import { Component, Point } from "brigsby/lib"
import { RenderMethod } from "brigsby/lib/renderer"
import { SpriteTransform } from "brigsby/lib/sprites"
import { Tilesets } from "../graphics/Tilesets"

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
