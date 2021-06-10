import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { Camera } from "../cutscenes/Camera"
import { MapGenerator } from "./MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Grid } from "../../engine/util/Grid"
import { WorldLocation } from "./WorldLocation"
import { LocationManager } from "./LocationManager"
import { StaticTileSource } from "../../engine/tiles/StaticTileSource"
import { TileTransform } from "../../engine/tiles/TileTransform"
import { Singletons } from "../Singletons"

/**
 * This is an optimization that pre-renders ground on an offscreen canvas
 */
export class GroundRenderer {

    static get instance() {
        return Singletons.getOrCreate(GroundRenderer)
    }
    
    // no lights should live outside of this range
    private size = MapGenerator.MAP_SIZE * TILE_SIZE * 2
    private shift = new Point(this.size/2, this.size/2)

    private tiles: Map<WorldLocation, Grid<StaticTileSource>> = new Map<WorldLocation, Grid<StaticTileSource>>()
    private gridDirty = true
    private lastLocationRendered: WorldLocation

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size
        this.context = this.canvas.getContext("2d")
    }

    addTile(wl: WorldLocation, position: Point, tile: StaticTileSource) {
        this.checkPt(position)
        const locationTileGrid = this.tiles.get(wl) ?? new Grid<StaticTileSource>()
        locationTileGrid.set(position, tile)
        this.tiles.set(wl, locationTileGrid)
        this.gridDirty = true
    }

    removeTile(wl: WorldLocation, position: Point) {
        this.checkPt(position)
        const locationTileGrid = this.tiles.get(wl)
        if (!locationTileGrid) {
            return  // it is ok to fail silently here
        }
        locationTileGrid.remove(position)
        this.gridDirty = true
    }

    private checkPt(position) {
        const lim = this.size/2
        if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
            throw new Error("light is outside of valid bounds")
        }
    }

    private renderToOffscreenCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const location = LocationManager.instance.currentLocation
        if (location.isInterior) {
            return
        }
        
        const locationTileGrid = this.tiles.get(location)
        if (!locationTileGrid) {
            return
        }

        locationTileGrid.entries().forEach(entry => {
            const pos = entry[0].times(TILE_SIZE).plus(this.shift)
            const tile = entry[1]
            const imageRender = tile.toImageRender(new TileTransform())
            this.context.drawImage(
                imageRender.source, 
                imageRender.sourcePosition.x, imageRender.sourcePosition.y, TILE_SIZE, TILE_SIZE,
                pos.x, pos.y, TILE_SIZE, TILE_SIZE, 
            )
        })
    }

    getEntity(): Entity {
        if (this.gridDirty || this.lastLocationRendered !== LocationManager.instance.currentLocation) {
            this.renderToOffscreenCanvas()
            this.gridDirty = false
            this.lastLocationRendered = LocationManager.instance.currentLocation
        }

        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))

        return new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            Camera.instance.position.plus(this.shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            Number.MIN_SAFE_INTEGER
        ))])
    }
}