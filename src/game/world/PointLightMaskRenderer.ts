import { Point } from "../../engine/point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Entity } from "../../engine/Entity"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { Camera } from "../cutscenes/Camera"
import { MapGenerator } from "./MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Grid } from "../../engine/util/Grid"
import { UIStateManager } from "../ui/UIStateManager"
import { WorldTime } from "./WorldTime"
import { Color } from "../ui/Color"
import { WorldLocation } from "./WorldLocation"
import { LocationManager } from "./LocationManager"

export class PointLightMaskRenderer {

    static instance: PointLightMaskRenderer

    // no lights should live outside of this range
    private size = MapGenerator.MAP_SIZE * TILE_SIZE// * 2
    private shift = new Point(this.size/2, this.size/2)

    private lightTiles: Map<WorldLocation, Grid<number>> = new Map<WorldLocation, Grid<number>>()
    private gridDirty = true
    private lastLocationRendered: WorldLocation
    private color: string
    private darkness = 0.4

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        PointLightMaskRenderer.instance = this

        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size
        this.context = this.canvas.getContext("2d")

        // refresh every so often to update transitioning color
        setInterval(() => this.gridDirty = true, WorldTime.MINUTE/10)
    }

    addLight(wl: WorldLocation, position: Point, diameter: number = 16) {
        if (diameter % 2 !== 0) {
            throw new Error("only even circle px diameters work right now")
        }
        this.checkPt(position)
        const locationLightGrid = this.lightTiles.get(wl) ?? new Grid<number>()
        locationLightGrid.set(position, diameter)
        this.lightTiles.set(wl, locationLightGrid)
        this.gridDirty = true
    }

    removeLight(wl: WorldLocation, position: Point) {
        this.checkPt(position)
        const locationLightGrid = this.lightTiles.get(wl)
        if (!locationLightGrid) {
            return  // it is ok to fail silently here
        }
        locationLightGrid.remove(position)
        this.gridDirty = true
    }

    /**
     * @return alpha 0-255 (total light to total darkness)
     */
    getDarknessAtPosition(pixelPt: Point) {
        const lim = this.size/2
        if (pixelPt.x < -lim || pixelPt.x > lim || pixelPt.y < -lim || pixelPt.y > lim) {
            return 255
        }
        const pt = pixelPt.plus(this.shift).apply(Math.floor)
        return this.context.getImageData(pt.x, pt.y, 1, 1).data[3]
    }

    private updateColorForTime() {
        const time = WorldTime.instance.time
        const hour = (time % WorldTime.DAY) / WorldTime.HOUR
		const timeSoFar = time % WorldTime.HOUR
		const clamp01 = (val) => Math.min(Math.max(val, 0), 1)

        const nightColor = this.colorFromString(Color.BLACK, 0.8)
        const sunriseColor = this.colorFromString(Color.PINK, 0.2)
        const dayColor = this.colorFromString(Color.LIGHT_PINK, 0)
        const sunsetColor = this.colorFromString(Color.DARK_PURPLE, 0.2)
        const transitionTime = WorldTime.HOUR

        // TODO: make these transitions quicker
        if (hour >= 5 && hour < 6) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 5) * WorldTime.HOUR)/transitionTime)
			return this.lerpedColorString(nightColor, sunriseColor, percentTransitioned) // sunrise		
		} else if (hour >= 6 && hour < 20) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 6) * WorldTime.HOUR)/transitionTime)
			return this.lerpedColorString(sunriseColor, dayColor, percentTransitioned)   // day	
		} else if (hour >= 20 && hour < 21) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 20) * WorldTime.HOUR)/transitionTime)			
			return this.lerpedColorString(dayColor, sunsetColor, percentTransitioned)    // sunset
		} else {
			const percentTransitioned = clamp01((timeSoFar + (24 + hour - 21) % 24 * WorldTime.HOUR)/transitionTime)			
			return this.lerpedColorString(sunsetColor, nightColor, percentTransitioned)  // night			
		}
    }

    /**
     * @param colorString A string from the Color object
     * @param a alpha double 0-1
     */
    private colorFromString(colorString: string, a: number): { r, g, b, a } {
        const noHash = colorString.replace("#", "")
        const r = parseInt(noHash.substring(0, 2), 16)
        const g = parseInt(noHash.substring(2, 4), 16)
        const b = parseInt(noHash.substring(4, 6), 16)
        return { r, g, b, a }
    }

    private lerpedColorString(color1: { r, g, b, a }, color2: { r, g, b, a }, percentTransitioned: number) {
        const lerp = (a, b) => a + (b-a) * percentTransitioned

        const r = lerp(color1.r, color2.r)
        const g = lerp(color1.g, color2.g)
        const b = lerp(color1.b, color2.b)
        const a = lerp(color1.a, color2.a)

        this.color = `rgba(${r}, ${g}, ${b}, ${a})`
        this.darkness = a
    }

    private checkPt(position) {
        const lim = this.size/2
        if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
            throw new Error("light is outside of valid bounds")
        }
    }

    private renderToOffscreenCanvas() {
        this.updateColorForTime()
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const location = LocationManager.instance.currentLocation
        if (location.isInterior || this.darkness === 0) {
            return
        }
        
        this.context.fillStyle = this.color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const locationLightGrid = this.lightTiles.get(location)
        if (!locationLightGrid) {
            return
        }

        locationLightGrid.entries().forEach(entry => {
            const pos = entry[0]
            const diameter = entry[1]
            const circleOffset = new Point(-.5, -.5).times(diameter)
            const adjustedPos = pos.plus(this.shift).plus(circleOffset)//.plus(new Point(TILE_SIZE/2, TILE_SIZE/2))
            
            this.makeLightCircle(diameter, adjustedPos, this.darkness/2)

            const innerOffset = Math.floor(diameter/2 * 1/4)
            this.makeLightCircle(diameter-innerOffset*2, adjustedPos.plus(new Point(innerOffset, innerOffset)), 0)
        })
    }

    private makeLightCircle(diameter: number, position: Point, alpha: number) {
        const center = new Point(diameter/2, diameter/2).minus(new Point(.5, .5))
        const imageData = this.context.getImageData(position.x, position.y, diameter, diameter)

        let cachedCircle = this.circleCache.get(diameter)
        if (!cachedCircle) {
            cachedCircle = []
            for (let x = 0; x < diameter; x++) {
                for (let y = 0; y < diameter; y++) {
                    const i = (x + y * diameter) * 4
                    const pt = new Point(x, y)
                    cachedCircle[i] = pt.distanceTo(center) < diameter/2
                }
            }
            this.circleCache.set(diameter, cachedCircle)
        }

        for (let i = 0; i < cachedCircle.length; i+=4) {
            if (cachedCircle[i]) {
                imageData.data[i+3] = Math.min(imageData.data[i+3], Math.ceil(255 * alpha))
            }
        }

        this.context.putImageData(imageData, position.x, position.y)
    }
    
    private readonly circleCache: Map<number, boolean[]> = new Map<number, boolean[]>()

    getEntity(): Entity {
        if (this.gridDirty || this.lastLocationRendered !== LocationManager.instance.currentLocation) {
            this.renderToOffscreenCanvas()
            this.gridDirty = false
            this.lastLocationRendered = LocationManager.instance.currentLocation
        }

        // prevent tint not extending to the edge
        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))

        return new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            Camera.instance.position.plus(this.shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
        ))])
    }
}