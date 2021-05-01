import { Point } from "../Point"
import { ImageRender } from "../renderer/ImageRender"
import { Component } from "../Component"
import { TileTransform } from "./TileTransform"
import { StaticTileSource } from "./StaticTileSource"

/**
 * Represents a static (non-animated) tile entity
 */
export class TileComponent extends Component {
    tileSource: StaticTileSource
    readonly transform: TileTransform

    constructor(tileSource: StaticTileSource, transform: TileTransform = new TileTransform()) {
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
