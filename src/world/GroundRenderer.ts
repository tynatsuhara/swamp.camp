import { Point } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer/ImageRender"
import { Entity } from "brigsby/dist/Entity"
import { BasicRenderComponent } from "brigsby/dist/renderer/BasicRenderComponent"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { WorldLocation } from "./WorldLocation"
import { LocationManager } from "./LocationManager"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Singletons } from "../Singletons"

/**
 * This is an optimization that pre-renders ground on an offscreen canvas. 
 * Not used by all ground types.
 */
export class GroundRenderer {

    static readonly DEPTH = Number.MIN_SAFE_INTEGER + 10

    static get instance() {
        return Singletons.getOrCreate(GroundRenderer)
    }
    
    private locations: Map<WorldLocation, HTMLCanvasElement> = new Map<WorldLocation, HTMLCanvasElement>()

    clearTile(wl: WorldLocation, position: Point) {
        let canvas = this.locations.get(wl)
        if (!canvas) {
            return
        }
        const context = canvas.getContext("2d")
        const shift = new Point(wl.size/2, wl.size/2)
        const pos = position.plus(shift).times(TILE_SIZE)
        context.clearRect(pos.x, pos.y, TILE_SIZE, TILE_SIZE)
    }

    addTile(wl: WorldLocation, position: Point, tile: StaticSpriteSource) {
        if (wl.isInterior || !wl.size) {
            throw new Error("location cannot use GroundRenderer")
        }
        const lim = wl.size/2
        if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
            throw new Error("tile is outside of valid bounds")
        }

        let canvas = this.locations.get(wl)
        if (!canvas) {
            canvas = document.createElement("canvas")
            canvas.width = wl.size * TILE_SIZE
            canvas.height = wl.size * TILE_SIZE
            this.locations.set(wl, canvas)
        }

        const context = canvas.getContext("2d")
        const shift = new Point(wl.size/2, wl.size/2)
        const pos = position.plus(shift).times(TILE_SIZE)
        context.drawImage(
            tile.image, 
            tile.position.x, tile.position.y, TILE_SIZE, TILE_SIZE,
            pos.x, pos.y, TILE_SIZE, TILE_SIZE, 
        )
    }

    getCanvas(wl: WorldLocation) {
        return this.locations.get(LocationManager.instance.currentLocation)
    }

    getEntity(): Entity {
        const wl = LocationManager.instance.currentLocation
        const canvas = this.locations.get(LocationManager.instance.currentLocation)
        if (!canvas) {
            return
        }

        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))
        const shift = new Point(1, 1).times(wl.size/2 * TILE_SIZE)

        return new Entity([new BasicRenderComponent(new ImageRender(
            canvas,
            Camera.instance.position.plus(shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            GroundRenderer.DEPTH
        ))])
    }
}