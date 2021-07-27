import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { ConnectingTileSchema } from "./ConnectingTileSchema"
import { GroundType } from "./Ground"
import { WorldLocation } from "../WorldLocation"
import { GroundRenderer } from "../GroundRenderer"

const CORNER_SIZE = TILE_SIZE/2
const CORNER_DIMS = new Point(CORNER_SIZE, CORNER_SIZE)

/**
 * Defines how a type of connecting tiles interacts with other types of connecting tiles.
 */
export class ConnectingTilePathSchema extends ConnectingTileSchema {

    private readonly type: GroundType
    private _cap: StaticSpriteSource
    private _single: StaticSpriteSource
    private _corners: StaticSpriteSource

    constructor(type: GroundType) {
        super()
        this.type = type
    }

    // a tile with one connection (on the bottom)
    cap(source: StaticSpriteSource) {
        this._cap = source
        return this
    }
   
    // a tile with no connections
    single(source: StaticSpriteSource) {
        this._single = source
        return this
    }

    corners(source: StaticSpriteSource) {
        this._corners = source
        return this
    }
  
    canConnect(schema: ConnectingTileSchema) {
        if (schema instanceof ConnectingTilePathSchema) {
            return (schema as ConnectingTilePathSchema).type === this.type
        }
        return false
    }
   
    /**
     * Renders the tile source based on the given grid and position
     */
    render(location: WorldLocation, position: Point): ImageRender[] {
        const x = position.x
        const y = position.y

        const n = this.get(location, new Point(x, y - 1))
        const ne = this.get(location, new Point(x + 1, y - 1))
        const e = this.get(location, new Point(x + 1, y))
        const se = this.get(location, new Point(x + 1, y + 1))
        const s = this.get(location, new Point(x, y + 1))
        const sw = this.get(location, new Point(x - 1, y + 1))
        const w = this.get(location, new Point(x - 1, y))
        const nw = this.get(location, new Point(x - 1, y - 1))
        
        const count = [n, ne, e, se, s, sw, w, nw].filter(dir => !!dir).length

        const render = (source: StaticSpriteSource, rotation: number = 0, offset = Point.ZERO) => {
            return source.toImageRender(SpriteTransform.new({ 
                position: position.times(TILE_SIZE).plus(offset), 
                rotation, 
                depth: GroundRenderer.DEPTH + 1
            }))
        }

        const corner = (x: number, y: number) => {
            const offset = new Point(x, y).times(CORNER_SIZE)
            const tile = new StaticSpriteSource(
                this._corners.image, 
                this._corners.position.plus(offset), 
                CORNER_DIMS
            )
            return render(tile, 0, offset)
        }

        let results: ImageRender[] = [
            // grass
            render(Tilesets.instance.tilemap.getTileAt(new Point(0, 7)))
        ]

        if (!n && !e && !s && !w) {
            results.push(render(this._single))
        } else if (count === 8) {
            results = [render(this._corners)]
        } else {
            if (n) {
                results.push(render(this._cap, 180))
            }
            if (n && ne && e) {
                results.push(corner(1, 0))
            }
            if (e) {
                results.push(render(this._cap, 270))
            }
            if (e && se && s) {
                results.push(corner(1, 1))
            }
            if (s) {
                results.push(render(this._cap, 0))
            }
            if (s && sw && w) {
                results.push(corner(0, 1))
            }
            if (w) {
                results.push(render(this._cap, 90))
            }
            if (w && nw && n) {
                results.push(corner(0, 0))
            }
        }

        return results
}
}
