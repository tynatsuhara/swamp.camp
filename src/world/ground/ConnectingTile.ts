import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { Component } from "brigsby/dist/Component"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { WorldLocation } from "../WorldLocation"
import { GroundRenderer } from "../GroundRenderer"
import { LocationManager } from "../LocationManager"

export class ConnectingTile extends Component {
    readonly schema: ConnectingTileSchema
    private readonly location: WorldLocation
    private readonly position: Point

    /**
     * Connecting tiles require a tile grid. The position parameter should be tile-scale, not pixel-scale.
     */
    constructor(schema: ConnectingTileSchema, location: WorldLocation, position: Point = new Point(0, 0)) {
        super()
        this.schema = schema
        this.location = location
        this.position = position
    }

    start() {
        GroundRenderer.instance.clearTile(LocationManager.instance.currentLocation, this.position)
    }

    getRenderMethods(): ImageRender[] {
        return this.schema.render(this.location, this.position)
    }
}