import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { TimeUnit } from "./TimeUnit"

/**
 * Renders a mask of darkness with light sources. This is a pure view 
 * that does not touch any global state in order to allow reusability.
 */
export class DarknessMask {

    // no lights should live outside of this range
    static readonly size = 100 * TILE_SIZE
    static readonly shift = new Point(DarknessMask.size/2, DarknessMask.size/2)

    // maps light source key to [position, diameter]
    private color: string
    private darkness = 0.4

    private context: CanvasRenderingContext2D
    private canvas: HTMLCanvasElement

    constructor() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = DarknessMask.size
        this.canvas.height = DarknessMask.size
        this.context = this.canvas.getContext("2d")
        
        this.reset(0)
    }

    // constants for time of day color
    static readonly DAYBREAK_HOUR = 5
    static readonly SUNRISE_HOUR = 6
    static readonly SUNSET_HOUR = 20
    static readonly DUSK_HOUR = 21

    // constants for light rendering
    static readonly VISIBILITY_MULTIPLIER = 2.25
    private static readonly PLAYER_VISIBLE_SURROUNDINGS_DIAMETER = 150
    private static readonly VISIBILE_LIGHT = .95
    private static readonly VISIBILE_LIGHT_EDGE = .975
    
    getDarkness = () => this.darkness

    reset(time: number) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.updateColorForTime(time)

        if (this.darkness > 0) {
            this.context.fillStyle = this.color
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    addFaintLightCircle(position: Point) {
        this.makeLightCircle(
            position, 
            DarknessMask.PLAYER_VISIBLE_SURROUNDINGS_DIAMETER, 
            DarknessMask.VISIBILE_LIGHT, 
            DarknessMask.VISIBILE_LIGHT_EDGE
        )
    }

    addLightCircle(centerPos: Point, diameter: number) {
        this.makeLightCircle(centerPos, diameter, 0, this.darkness/2)
        this.makeLightCircle(
            centerPos, 
            diameter * DarknessMask.VISIBILITY_MULTIPLIER, 
            DarknessMask.VISIBILE_LIGHT, 
            DarknessMask.VISIBILE_LIGHT_EDGE
        )
    }

    private updateColorForTime(time: number) {
        const hour = (time % TimeUnit.DAY) / TimeUnit.HOUR
		const timeSoFar = time % TimeUnit.HOUR
		const clamp01 = (val) => Math.min(Math.max(val, 0), 1)

        const nightColor = this.colorFromString(Color.BLACK, 1)
        const sunriseColor = this.colorFromString(Color.PINK, 0.2)
        const dayColor = this.colorFromString(Color.LIGHT_PINK, 0)
        const sunsetColor = this.colorFromString(Color.DARK_PURPLE, 0.2)
        const transitionTime = TimeUnit.HOUR

        const daybreak = DarknessMask.DAYBREAK_HOUR
        const sunrise = DarknessMask.SUNRISE_HOUR
        const sunset = DarknessMask.SUNSET_HOUR
        const dusk = DarknessMask.DUSK_HOUR

        // TODO: make these transitions quicker
        if (hour >= daybreak && hour < sunrise) {
			const percentTransitioned = clamp01((timeSoFar + (hour - daybreak) * TimeUnit.HOUR)/transitionTime)
			this.lerpColorString(nightColor, sunriseColor, percentTransitioned) // sunrise		
		} else if (hour >= sunrise && hour < sunset) {
			const percentTransitioned = clamp01((timeSoFar + (hour - sunrise) * TimeUnit.HOUR)/transitionTime)
			this.lerpColorString(sunriseColor, dayColor, percentTransitioned)   // day	
		} else if (hour >= sunset && hour < dusk) {
			const percentTransitioned = clamp01((timeSoFar + (hour - sunset) * TimeUnit.HOUR)/transitionTime)			
			this.lerpColorString(dayColor, sunsetColor, percentTransitioned)    // sunset
		} else {
			const percentTransitioned = clamp01((timeSoFar + (24 + hour - dusk) % 24 * TimeUnit.HOUR)/transitionTime)			
			this.lerpColorString(sunsetColor, nightColor, percentTransitioned)  // night			
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

    private lerpColorString(color1: { r, g, b, a }, color2: { r, g, b, a }, percentTransitioned: number) {
        const lerp = (a, b) => a + (b-a) * percentTransitioned

        const r = lerp(color1.r, color2.r)
        const g = lerp(color1.g, color2.g)
        const b = lerp(color1.b, color2.b)
        const a = lerp(color1.a, color2.a)

        this.color = `rgba(${r}, ${g}, ${b}, ${a})`
        this.darkness = a
    }

    private makeLightCircle(centerPos: Point, diameter: number, innerAlpha: number, outerAlpha: number) {
        if (this.darkness === 0) {
            return
        }
        
        const circleOffset = new Point(-.5, -.5).times(diameter)
        const adjustedPos = centerPos.plus(DarknessMask.shift).plus(circleOffset)
        
        this.makeLightCircleHelper(diameter, adjustedPos, outerAlpha)

        const innerOffset = Math.floor(diameter/2 * 1/4)
        this.makeLightCircleHelper(diameter-innerOffset*2, adjustedPos.plus(new Point(innerOffset, innerOffset)), innerAlpha)
    }

    private makeLightCircleHelper(diameter: number, position: Point, alpha: number) {
        const center = new Point(diameter/2, diameter/2).minus(new Point(.5, .5))
        const imageData = this.context.getImageData(position.x, position.y, diameter, diameter)

        let cachedCircle = DarknessMask.circleCache.get(diameter)
        if (!cachedCircle) {
            cachedCircle = []
            for (let x = 0; x < diameter; x++) {
                for (let y = 0; y < diameter; y++) {
                    const i = (x + y * diameter) * 4
                    const pt = new Point(x, y)
                    cachedCircle[i] = pt.distanceTo(center) < diameter/2
                }
            }
            DarknessMask.circleCache.set(diameter, cachedCircle)
        }

        for (let i = 0; i < cachedCircle.length; i+=4) {
            if (cachedCircle[i]) {
                imageData.data[i+3] = Math.min(imageData.data[i+3], Math.ceil(255 * alpha))
            }
        }

        this.context.putImageData(imageData, position.x, position.y)
    }
    
    private static readonly circleCache: Map<number, boolean[]> = new Map<number, boolean[]>()

    getEntity(dimensions: Point, offset: Point): Entity {
        // prevent tint not extending to the edge
        const _dimensions = dimensions.plus(new Point(1, 1))

        return new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            offset.plus(DarknessMask.shift).apply(Math.floor),
            _dimensions,
            offset.apply(Math.floor),
            _dimensions,
            UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
        ))])
    }
}