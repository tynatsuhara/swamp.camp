import { StaticTileSource } from "./StaticTileSource"
import { Point } from "../point"
import { ImageRender } from "../renderer/ImageRender"
import { TileTransform } from "./TileTransform"
import { ConnectingTile } from "./ConnectingTile"
import { Entity } from "../Entity"
import { Grid } from "../util/Grid"

/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 * TODO: This could probably be a lot better and support more complex connecting logic
 */
export class ConnectingTileSchema {
    private _vertical: StaticTileSource
    private _angle: StaticTileSource
    private _tShape: StaticTileSource
    private _plusShape: StaticTileSource
    private _cap: StaticTileSource
    private _single: StaticTileSource
    private _fallback: StaticTileSource

    // a vertical line
    vertical(source: StaticTileSource): ConnectingTileSchema {
        this._vertical = source
        return this
    }

    // a 90 degree angle, connecting to bottom and right by default
    angle(source: StaticTileSource): ConnectingTileSchema {
        this._angle = source
        return this
    }

    // a T-shaped tile (with the bottom part pointing right)
    tShape(source: StaticTileSource): ConnectingTileSchema {
        this._tShape = source
        return this
    }
   
    // a plus-shaped tile
    plusShape(source: StaticTileSource): ConnectingTileSchema {
        this._plusShape = source
        return this
    }
  
    // a tile with one connection (on the bottom)
    cap(source: StaticTileSource): ConnectingTileSchema {
        this._cap = source
        return this
    }
   
    // a tile with no connections
    single(source: StaticTileSource): ConnectingTileSchema {
        this._single = source
        return this
    }
 
    // used if we can't figure
    fallback(source: StaticTileSource): ConnectingTileSchema {
        this._fallback = source
        return this
    }
  
    setCanConnectFunction(fn: (ConnectingTileSchema) => boolean): ConnectingTileSchema {
        this.canConnect = fn
        return this
    }
  
    canConnect(schema: ConnectingTileSchema) {
        return schema === this
    }
   
    /**
     * Renders the tile source based on the given grid and position
     */
    render(grid: Grid<Entity>, position: Point): ImageRender {
        const x = position.x
        const y = position.y

        // TODO: add diagonals?
        const n = this.get(grid, new Point(x, y - 1))
        const s = this.get(grid, new Point(x, y + 1))
        const e = this.get(grid, new Point(x + 1, y))
        const w = this.get(grid, new Point(x - 1, y))
        const count = [n, s, e, w].filter(dir => !!dir).length

        let result: StaticTileSource
        let rotation = 0

        if (count == 4) {
            result = this._plusShape
        } else if (count == 3) {
            result = this._tShape
            if (!n) {
                rotation = 90
            } else if (!e) {
                rotation = 180
            } else if (!s) {
                rotation = 270
            }
        } else if ((n && s) || (e && w)) {
            result = this._vertical
            if (!n) {
                rotation = 90
            }
        } else if (count == 2) {
            result = this._angle
            if (n && e) {
                rotation = 270
            } else if (s && w) {
                rotation = 90
            } else if (w && n) {
                rotation = 180
            }
        } else if (count == 1) {
            result = this._cap
            if (n) {
                rotation = 180
            } else if (e) {
                rotation = 270
            } else if (w) {
                rotation = 90
            }
        } else {
            result = this._single
        }

        if (!result) {
            result = this._fallback
            rotation = 0
        }

        // TODO trigger adjacent to update?
        return result.toImageRender(new TileTransform(position.times(result.dimensions.x), null, rotation))
    }

    private get(grid: Grid<Entity>, pt: Point): ConnectingTile {
        const el = grid.get(pt)
        if (el) {
            const ct = el.getComponent(ConnectingTile)
            if (ct && ct.schema.canConnect(this)) {
                return ct
            }
        }
    }
}
