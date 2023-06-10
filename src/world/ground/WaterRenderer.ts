import { AnonymousComponent, Entity, Point, pt } from "brigsby/dist"
import { BasicRenderComponent, ImageRender } from "brigsby/dist/renderer"
import { Animator } from "brigsby/dist/util/Animator"
import { Singletons } from "../../core/Singletons"
import { Camera } from "../../cutscenes/Camera"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Location } from "../locations/Location"
import { here } from "../locations/LocationManager"

const WATER_ANIMATOR = new Animator([750, 750])

/**
 * This is an optimization that pre-renders water on an offscreen canvas.
 */
export class WaterRenderer {
    static readonly DEPTH = Number.MIN_SAFE_INTEGER + 5

    static get instance() {
        return Singletons.getOrCreate(WaterRenderer)
    }

    private locations: Map<Location, [HTMLCanvasElement, HTMLCanvasElement]> = new Map()

    /**
     * @param position will NOT be checked against location size bounds
     */
    setWaterTile(wl: Location, position: Point) {
        if (wl.isInterior || !wl.size) {
            throw new Error("location cannot use GroundRenderer")
        }

        let canvases = this.locations.get(wl)
        if (!canvases) {
            canvases = [document.createElement("canvas"), document.createElement("canvas")]
            canvases.forEach((canvas) => {
                canvas.width = wl.size * TILE_SIZE
                canvas.height = wl.size * TILE_SIZE
            })
            this.locations.set(wl, canvases)
        }

        canvases.forEach((canvas, index) => {
            const tile = [
                Tilesets.instance.tilemap.getTileAt(pt(6, 0)),
                Tilesets.instance.tilemap.getTileAt(pt(6, 1)),
            ][index].rotated(Math.floor(Math.random() * 4) * 90)
            const context = canvas.getContext("2d")
            const shift = pt(wl.size / 2, wl.size / 2)
            const pos = position.plus(shift).times(TILE_SIZE)
            context.drawImage(
                tile.image,
                tile.position.x,
                tile.position.y,
                TILE_SIZE,
                TILE_SIZE,
                pos.x,
                pos.y,
                TILE_SIZE,
                TILE_SIZE
            )
        })
    }

    getCanvas(wl: Location) {
        const canvases = this.locations.get(wl)
        return canvases[WATER_ANIMATOR.getCurrentFrame()]
    }

    getEntity(): Entity {
        const wl = here()
        const canvases = this.locations.get(wl)
        if (!canvases) {
            return
        }

        const dimensions = Camera.instance.dimensions.plus(pt(1))
        const shift = pt(1).times((wl.size / 2) * TILE_SIZE)

        const animationUpdater = new AnonymousComponent({
            update: ({ elapsedTimeMillis }) => WATER_ANIMATOR.update(elapsedTimeMillis),
        })

        const canvas = canvases[WATER_ANIMATOR.getCurrentFrame()]
        const render = new ImageRender(
            canvas,
            Camera.instance.position.plus(shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            WaterRenderer.DEPTH
        )

        return new Entity([animationUpdater, new BasicRenderComponent(render)])
    }
}
