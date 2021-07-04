import { ImageRender } from "../renderer/ImageRender"
import { Component } from "../Component"
import { SpriteTransform } from "./SpriteTransform"
import { StaticSpriteSource } from "./StaticSpriteSource"

/**
 * Represents a static (non-animated) tile entity
 */
export class SpriteComponent extends Component {
    tileSource: StaticSpriteSource
    readonly transform: SpriteTransform

    constructor(tileSource: StaticSpriteSource, transform: SpriteTransform = new SpriteTransform()) {
        super()
        this.tileSource = tileSource
        this.transform = transform

        if (!transform.dimensions) {
            transform.dimensions = tileSource.dimensions
        }
    }
    
    getRenderMethods(): ImageRender[] {
        return [this.tileSource.toImageRender(this.transform)]
    }
}
