import { Point } from "../../engine/point"
import { ConnectingTileSchema } from "../../engine/tiles/ConnectingTileSchema"
import { ConnectingTile } from "../../engine/tiles/ConnectingTile"
import { Entity } from "../../engine/Entity"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { TILE_SIZE, Tilesets } from "../graphics/Tilesets"
import { WorldLocation } from "./WorldLocation"
import { Campfire } from "./elements/Campfire"
import { makeTent, TentColor } from "./elements/Tent"
import { makeTree, TreeType } from "./elements/Tree"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { makeRock } from "./elements/Rock"
import { TileSource } from "../../engine/tiles/TileSource"

const MAP_SIZE = 40

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
        makeTent(this.location, new Point(5, 5), TentColor.RED, tentLocation)

        // spawn campfire
        const campfirePos = new Point(3, 9)
        this.location.stuff.set(campfirePos, new Entity([new Campfire(campfirePos)]))

        // make the ground
        this.renderPath(new Point(-10, -10), new Point(10, 10), this.pathSchema, 2)
        this.renderPath(new Point(10, -10), new Point(-10, 10), this.pathSchema, 5)

        this.spawnTrees()
        this.spawnRocks()

        // TODO short trees, bushes, fruit, tall grass, etc

        // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
        this.placeGrass()

        return this.location
    }

    spawnTrees() {
        const trees = Math.random() * 150 + 50
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2,
                Math.floor(Math.random() * (MAP_SIZE-1)) - MAP_SIZE/2,
            )
            const occupiedPoints = [pt, pt.plus(new Point(0, 1))]
            if (occupiedPoints.every(p => !this.location.stuff.get(p) && !this.location.ground.get(p))) {
                makeTree(this.location, pt, Math.random() < .7 ? TreeType.POINTY : TreeType.ROUND)
            }
        }
    }

    spawnRocks() {
        let placedRocks = 0
        while (placedRocks < 20) {
            const p = new Point(
                Math.floor(Math.random() * MAP_SIZE) - MAP_SIZE/2,
                Math.floor(Math.random() * (MAP_SIZE)) - MAP_SIZE/2,
            )
            if (!this.location.stuff.get(p) && !this.location.ground.get(p)) {
                makeRock(this.location, p)
                placedRocks++
            }
        }
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
        for (let i = -MAP_SIZE/2; i < MAP_SIZE/2; i++) {
            for (let j = -MAP_SIZE/2; j < MAP_SIZE/2; j++) {
                const pt = new Point(i, j)
                if (!this.location.ground.get(pt)) {
                    let tile: TileSource
                    if (Math.random() < .65) {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, Math.floor(Math.random() * 4)))
                    } else {
                        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
                    }
                    const tileComponent = tile.toComponent()
                    tileComponent.transform.position = pt.times(TILE_SIZE)
                    this.location.ground.set(pt, new Entity([tileComponent]))
                }
            }
        }
    }
}