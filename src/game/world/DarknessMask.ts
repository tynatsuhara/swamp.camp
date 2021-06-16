import { debug } from "../../engine/Debug"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Lists } from "../../engine/util/Lists"
import { Lantern } from "../characters/weapons/Lantern"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color, getRGB } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { Campfire } from "./elements/Campfire"
import { TimeUnit } from "./TimeUnit"
import { WorldTime } from "./WorldTime"

/**
 * Renders a mask of darkness with light sources. This is a pure view 
 * that does not touch any global state in order to allow reusability.
 */
export class DarknessMask {

    static readonly DEPTH = UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light

    // no lights should live outside of this range
    static readonly size = 100 * TILE_SIZE
    static readonly shift = new Point(DarknessMask.size/2, DarknessMask.size/2)

    // maps light source key to [position, diameter]
    private color: string
    private darkness = 0.4

    private readonly context: CanvasRenderingContext2D
    private readonly canvas: HTMLCanvasElement
    private readonly allowNightVision: boolean

    constructor(allowNightVision: boolean) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = DarknessMask.size
        this.canvas.height = DarknessMask.size
        this.context = this.canvas.getContext("2d")
        this.allowNightVision = allowNightVision
        
        this.reset(0)

        // pre-populate the cache with expected light sizes
        for (let i = 1; i <= Campfire.LOG_CAPACITY; i++) {
            this.populateBitmapCache(Campfire.getLightSizeForLogCount(i))
        }
        this.populateBitmapCache(Lantern.DIAMETER)
    }

    private populateBitmapCache(diameter: number) {
        const diameters = [
            diameter,
            this.getInnerCircleDiameter(diameter),
            diameter * DarknessMask.VISIBILITY_MULTIPLIER,
            this.getInnerCircleDiameter(diameter * DarknessMask.VISIBILITY_MULTIPLIER)
        ]
        diameters.forEach(this.createImageBitmap)
    }

    // constants for time of day
    static readonly SUNRISE_START = 5 * TimeUnit.HOUR
    static readonly SUNRISE_END = 5.5 * TimeUnit.HOUR
    static readonly SUNSET_START = 20.5 * TimeUnit.HOUR
    static readonly SUNSET_END = 21 * TimeUnit.HOUR

    // constants for light rendering
    static readonly VISIBILITY_MULTIPLIER = 2.25
    private static readonly PLAYER_VISIBLE_SURROUNDINGS_DIAMETER = 150
    private static readonly VISIBILE_LIGHT = .95
    private static readonly VISIBILE_LIGHT_EDGE = .975
    
    reset(time: number) {
        this.circleQueue = []
        this.updateColorForTime(time)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.darkness === 0) {
            return
        }

        // start with a full black darkness overlay
        this.context.globalCompositeOperation = "source-over"
        this.context.fillStyle = Color.BLACK
        this.context.globalAlpha = 1
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
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

    private getPercentTransitioned = (current: number, start: number, end: number) => {
        const val = (current - start)/(end - start)
        return Math.min(Math.max(val, 0), 1)
    }

    private readonly NIGHT_COLOR = this.colorFromString(Color.BLACK, 1)
    private readonly SUNRISE_COLOR = this.colorFromString(Color.PINK, 0.5)
    private readonly DAY_COLOR = this.colorFromString(Color.LIGHT_PINK, 0)
    private readonly SUNSET_COLOR = this.colorFromString(Color.PURPLE, 0.3)

    private updateColorForTime(time: number) {
        const timeOfDay = time % TimeUnit.DAY

        let rgba: RGBA

        if (timeOfDay >= DarknessMask.SUNRISE_START && timeOfDay < DarknessMask.SUNRISE_END) {
            const pct = this.getPercentTransitioned(timeOfDay, DarknessMask.SUNRISE_START, DarknessMask.SUNRISE_END)
			rgba = this.lerpColorStrings(this.NIGHT_COLOR, this.SUNRISE_COLOR, this.DAY_COLOR, pct)	
		} else if (timeOfDay >= DarknessMask.SUNRISE_END && timeOfDay < DarknessMask.SUNSET_START) {
            rgba = this.DAY_COLOR
		} else if (timeOfDay >= DarknessMask.SUNSET_START && timeOfDay < DarknessMask.SUNSET_END) {
            const pct = this.getPercentTransitioned(timeOfDay, DarknessMask.SUNSET_START, DarknessMask.SUNSET_END)
			rgba = this.lerpColorStrings(this.DAY_COLOR, this.SUNSET_COLOR, this.NIGHT_COLOR, pct)	
		} else {
			rgba = this.NIGHT_COLOR
		}

        if (debug.nightVision && this.allowNightVision) {
            rgba = this.colorFromString(Color.PURPLE, .85)
        }

        const { r, g, b, a } = rgba
        this.color = `rgba(${r}, ${g}, ${b}, ${a})`
        this.darkness = a
    }

    /**
     * @param colorString A string from the Color object
     * @param a alpha double 0-1
     */
    private colorFromString(colorString: string, a: number): RGBA {
        const noHash = colorString.replace("#", "")
        const r = parseInt(noHash.substring(0, 2), 16)
        const g = parseInt(noHash.substring(2, 4), 16)
        const b = parseInt(noHash.substring(4, 6), 16)
        return { r, g, b, a }
    }

    private lerpColorStrings(start: RGBA, midpoint: RGBA, end: RGBA, percentTransitioned: number): RGBA {
        if (percentTransitioned < .5) {
            return this.lerpColorString(start, midpoint, percentTransitioned * 2)
        } else {
            return this.lerpColorString(midpoint, end, percentTransitioned * 2 - 1)
        }
    }

    private lerpColorString(color1: RGBA, color2: RGBA, percentTransitioned: number): RGBA {
        const lerp = (a: number, b: number) => a + (b-a) * percentTransitioned

        const r = lerp(color1.r, color2.r)
        const g = lerp(color1.g, color2.g)
        const b = lerp(color1.b, color2.b)
        const a = lerp(color1.a, color2.a)

        return { r, g, b, a }
    }

    private makeLightCircle(centerPos: Point, diameter: number, innerAlpha: number, outerAlpha: number) {
        if (this.darkness === 0) {
            return
        }
        
        const circleOffset = new Point(-.5, -.5).times(diameter)
        const adjustedPos = centerPos.plus(DarknessMask.shift).plus(circleOffset).apply(Math.floor)
        
        this.addCircleToQueue(diameter, adjustedPos, outerAlpha)

        const innerDiameter = this.getInnerCircleDiameter(diameter)
        this.addCircleToQueue(innerDiameter, adjustedPos.plus(new Point(1, 1).times((diameter - innerDiameter)/2)), innerAlpha)
    }

    private getInnerCircleDiameter(diameter: number) {
        const innerOffset = Math.floor(diameter/2 * 1/4)
        return diameter - innerOffset * 2
    }

    // array of (diameter, topLeftPos, alpha)
    private circleQueue: [number, Point, number][] = []

    /**
     * Queues a light to be rendered
     */
    private addCircleToQueue(diameter: number, position: Point, alpha: number) {
        this.circleQueue.push([diameter, position, alpha])
        // sort in decreasing order of alpha (most opaque => most transparent)
        this.circleQueue.sort((a, b) => b[2] - a[2])
    }
    
    private static readonly circleCache: Map<number, ImageBitmap> = new Map<number, ImageBitmap>()

    /**
     * Renders the darkness mask. This can't be called as a one-off 
     * because circle image bitmaps render asyncronously.
     */
    render(dimensions: Point, offset: Point): Entity {
        // prevent tint not extending to the edge
        const _dimensions = dimensions.plus(new Point(1, 1))

        if (this.darkness > 0) {
            this.circleQueue.forEach(circle => this.drawCircleToCanvas(...circle))
            // overlay the time-specific color
            this.context.globalCompositeOperation = "source-in"
            this.context.fillStyle = this.color
            this.context.globalAlpha = this.darkness
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }
        
        return new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            offset.plus(DarknessMask.shift).apply(Math.floor),
            _dimensions,
            offset.apply(Math.floor),
            _dimensions,
            DarknessMask.DEPTH
        ))])
    }

    private drawCircleToCanvas(diameter: number, position: Point, alpha: number) {
        const circleBitmap = DarknessMask.circleCache.get(diameter)
        if (!circleBitmap) {
            this.createImageBitmap(diameter)
            return
        }

        // Erase the circle
        this.context.globalAlpha = 1
        this.context.globalCompositeOperation = "destination-out"
        this.context.drawImage(circleBitmap, position.x, position.y)

        // Draw the circle with the correct alpha
        if (alpha > 0) {
            this.context.globalAlpha = alpha
            this.context.globalCompositeOperation = "source-over"
            this.context.drawImage(circleBitmap, position.x, position.y)
        }
    }

    private createImageBitmap(diameter: number) {
        if (DarknessMask.circleCache.get(diameter)) {
            return
        }
        const center = new Point(diameter/2, diameter/2).minus(new Point(.5, .5))
        const imageBuffer: number[] = Lists.repeat(diameter * diameter, [...getRGB(Color.BLACK), 0])
        for (let x = 0; x < diameter; x++) {
            for (let y = 0; y < diameter; y++) {
                const alphaIndex = (x + y * diameter) * 4 + 3
                const pt = new Point(x, y)
                imageBuffer[alphaIndex] = (pt.distanceTo(center) < diameter/2) ? 255 : 0
            }
        }
        const imageData = new ImageData(new Uint8ClampedArray(imageBuffer), diameter, diameter)
        createImageBitmap(imageData).then(bitmap => {
            DarknessMask.circleCache.set(diameter, bitmap)
        })
    }
}

type RGBA = { 
    r: number,
    g: number,
    b: number,
    a: number,
}
