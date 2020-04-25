import { Point } from "../../engine/point"
import { ConnectingTileSchema } from "../../engine/tiles/ConnectingTileSchema"
import { ConnectingTile } from "../../engine/tiles/ConnectingTile"
import { Entity } from "../../engine/Entity"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { Grid } from "../../engine/util/Grid"
import { TileSource } from "../../engine/tiles/TileSource"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { Collider } from "../../engine/collision/Collider"
import { WorldLocation } from "./WorldLocation"
import { Campfire } from "./elements/Campfire"
import { makeTent, TentColor } from "./elements/Tent"

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

    private readonly location = new WorldLocation()

    doIt(): WorldLocation {
        const tentLocation = new WorldLocation()
        
        // spawn tent
        makeTent(this.location, new Point(5, 5), TentColor.red, tentLocation)

        // spawn campfire
        const campfirePos = new Point(3, 9)
        this.location.stuff.set(campfirePos, new Entity([new Campfire(campfirePos)]))

        // make the ground
        this.renderPath(new Point(-10, -10), new Point(10, 10), this.pathSchema, 2)
        this.renderPath(new Point(10, -10), new Point(-10, 10), this.pathSchema, 5)
        this.placeGrass()

        return this.location
    }

    renderPath(
        start: Point, 
        end: Point, 
        tileSchema: ConnectingTileSchema,
        randomness: number
    ) {
        const ground = this.location.ground
        const stuff = this.location.stuff

        const heuristic = (pt: Point): number => {
            const v = pt.distanceTo(end) * Math.random() * randomness
            const el = ground.get(pt)
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

        const isOccupiedFunc = (pt: Point) => {
            if (!!stuff.get(pt)?.getComponent(BoxCollider)) {
                return true
            }
            const el = ground.get(pt)
            if (!el) {
                return false  // definitely not occupied
            }
            const ct = el.getComponent(ConnectingTile)
            if (!ct) {
                return true  // can't connect, therefore occupied
            }
            return !tileSchema.canConnect(ct.schema)
        }

        const path = ground.findPath(
            start, 
            end, 
            heuristic, 
            isOccupiedFunc
        )

        if (!path) {
            return
        }

        path.forEach(pt => {
            const entity = new Entity([
                new ConnectingTile(tileSchema, ground, pt),
                // new BoxCollider(pt.times(TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE), true)
            ])
            ground.set(pt, entity)
        })
    }

    placeGrass() {
        for (let i = -20; i < 20; i++) {
            for (let j = -20; j < 20; j++) {
                const pt = new Point(i, j)
                if (!this.location.ground.get(pt)) {
                    let tile
                    if (Math.random() < .65) {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, Math.floor(Math.random() * 4)))
                    } else {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
                    }
                    this.location.ground.set(pt, tile.at(pt))
                }
            }
        }
    }
}