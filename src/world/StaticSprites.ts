import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { RenderMethod } from "brigsby/dist/renderer/RenderMethod"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets } from "../graphics/Tilesets"

export class StaticSprites extends Component {
    private json: object[] = []
    private renders: RenderMethod[] = []

    addSprite(key: String, pixelPos: Point, rotation: number = 0, depth: number = 0) {
        this.addSpriteInternal({
            k: key,
            p: pixelPos.toString(),
            r: rotation !== 0 ? rotation : undefined,
            d: depth !== 0 ? depth : undefined,
        })
    }

    private addSpriteInternal(sprite: object) {
        this.json.push(sprite)
        const tile = Tilesets.instance.getBasicTileSource(sprite["k"])
        const render = tile.toImageRender(
            SpriteTransform.new({
                position: Point.fromString(sprite["p"]),
                rotation: sprite["r"] || 0,
                depth: sprite["d"] || 0,
            })
        )
        this.renders.push(render)
    }

    toJson(): object[] {
        return this.json
    }

    fromJson(sprites: object[]) {
        this.json = []
        this.renders = []
        sprites.forEach((s) => this.addSpriteInternal(s))
    }

    getRenderMethods() {
        return this.renders
    }
}
