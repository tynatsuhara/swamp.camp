import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { Component } from "../component"
import { TileTransform } from "./TileTransform"
import { TileSource } from "./TileSource"

/**
 * Represents a static (non-animated) tile entity
 */
export class TileComponent extends Component {
    tileSource: TileSource
    readonly transform: TileTransform

    constructor(tileSource: TileSource, transform: TileTransform = new TileTransform()) {
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
