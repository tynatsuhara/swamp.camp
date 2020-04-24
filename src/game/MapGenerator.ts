import { Point } from "../engine/point"
import { ConnectingTileSchema } from "../engine/tiles/ConnectingTileSchema"
import { ConnectingTile } from "../engine/tiles/ConnectingTile"
import { Entity } from "../engine/Entity"
import { BoxCollider } from "../engine/collision/BoxCollider"
import { TILE_SIZE, Tilesets } from "./graphics/Tilesets"
import { Grid } from "../engine/util/Grid"
import { TileEntityManager } from "./TileEntityManager"

export class MapGenerator {

    readonly oldPathSchema = new ConnectingTileSchema()
            .vertical(Tilesets.instance.outdoorTiles.getTileAt(new Point(9, 7)))
            .angle(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 7)))
            .tShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(5, 8)))
            .plusShape(Tilesets.instance.outdoorTiles.getTileAt(new Point(7, 12)))
            .cap(Tilesets.instance.outdoorTiles.getTileAt(new Point(6, 11)))
            .single(Tilesets.instance.outdoorTiles.getTileAt(new Point(8, 12)))

    readonly pathSchema = new ConnectingTileSchema()
            .vertical(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
            .angle(Tilesets.instance.tilemap.getTileAt(new Point(0, 5)))
            .tShape(Tilesets.instance.tilemap.getTileAt(new Point(3, 5)))
            .plusShape(Tilesets.instance.tilemap.getTileAt(new Point(5, 5)))
            .cap(Tilesets.instance.tilemap.getTileAt(new Point(2, 6)))
            .single(Tilesets.instance.tilemap.getTileAt(new Point(7, 5)))


    doIt() {
        this.renderPath(new Point(-10, -10), new Point(10, 10), this.pathSchema, 2)
        this.renderPath(new Point(10, -10), new Point(-10, 10), this.pathSchema, 5)

        for (let i = -20; i < 20; i++) {
            for (let j = -20; j < 20; j++) {
                const pt = new Point(i, j)
                if (!TileEntityManager.instance.get(pt)) {
                    let tile
                    if (Math.random() < .65) {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, Math.floor(Math.random() * 4)))
                    } else {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
                    }
                    TileEntityManager.instance.set(pt, new Entity([tile.at(pt)]))
                }
            }
        }
    }

    renderPath(
        start: Point, 
        end: Point, 
        tileSchema: ConnectingTileSchema,
        randomness: number
    ) {
        const grid = TileEntityManager.instance
        const heuristic = (pt: Point): number => {
            const v = pt.distanceTo(end) * Math.random() * randomness
            const el = grid.get(pt)
            if (!el) {
                return v
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct || !ct.schema.canConnect(tileSchema)) {
                return v
            }
            const reuseCostMultiplier = 1/10
            return v * reuseCostMultiplier
        }

        const occupiedCannotConnect = (pt: Point) => {
            const el = grid.get(pt)
            if (!el) {
                return false  // definitely not occupied
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct) {
                return true  // can't connect, therefore occupied
            }
            return !tileSchema.canConnect(ct.schema)
        }

        const path = grid.findPath(
            start, 
            end, 
            heuristic, 
            occupiedCannotConnect
        )

        if (!path) {
            return
        }

        path.forEach(pt => {
            const entity = new Entity([
                new ConnectingTile(tileSchema, grid, pt),
                // new BoxCollider(pt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE), true)
            ])
            grid.set(pt, entity)
        })
    }
}