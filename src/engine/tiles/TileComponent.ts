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

    constructor(tileSource: TileSource, position: Point = new Point(0, 0)) {
        super()
        this.tileSource = tileSource
        this.transform = new TileTransform(position, tileSource.dimensions)
    }
    
    getRenderMethods(): ImageRender[] {
        return [this.tileSource.toImageRender(this.transform)]
    }
}
