import { Point } from "../point";
import { ImageRender } from "../renderer/ImageRender";
import { Component } from "../component";
import { TileTransform } from "./TileTransform";
import { TileSource } from "./TileSource";

/**
 * Represents a static (non-animated) tile entity
 */
export class TileComponent extends Component {
    tileSource: TileSource;
    readonly transform: TileTransform = new TileTransform();

    constructor(tileSource: TileSource, position: Point = new Point(0, 0)) {
        super();
        this.tileSource = tileSource;
        this.transform.position = position;
    }
    
    getRenderMethods(): ImageRender[] {
        return [this.tileSource.toRenderImage(this.transform)];
    }
}
