import { Component, debug, Point, UpdateData } from "brigsby/dist"
import { pt } from "brigsby/dist/Point"
import { ImageRender } from "brigsby/dist/renderer"
import { Lists } from "brigsby/dist/util"
import { Dude } from "../characters/Dude"
import { Lantern } from "../characters/weapons/Lantern"
import { Torch } from "../characters/weapons/Torch"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color, getRGB } from "../ui/Color"
import { UI_SPRITE_DEPTH } from "../ui/UiConstants"
import { Campfire } from "./elements/Campfire"
import { TimeUnit } from "./TimeUnit"

/**
 * Renders a mask of darkness with light sources. This is a pure view
 * that does not touch any global state in order to allow reusability.
 *
 * NOTE: IF YOU SEE ANY FLICKERING LIGHT CIRCLES, IT IS PROBABLY DUE TO NOT
 * PRE-POPULATING THE BITMAP CACHE. ADD THE DIAMETER TO THE CONSTRUCTOR HERE!
 */
export class DarknessMask extends Component {
    static readonly DEPTH = UI_SPRITE_DEPTH - 100 // make sure all UI goes on top of light

    // no lights should live outside of this range
    // TODO: make this size dynamic (it will improve performance if we only fill the visible region)
    static readonly size = 110 * TILE_SIZE
    static readonly shift = pt(DarknessMask.size / 2)

    private static readonly circleCache: Map<number, ImageBitmap> = new Map<number, ImageBitmap>()

    // maps light source key to [position, diameter]
    private color: string
    private darkness = 0.4

    private readonly context: CanvasRenderingContext2D
    private readonly canvas: HTMLCanvasElement

    constructor(private readonly allowNightVision: boolean) {
        super()
        this.canvas = document.createElement("canvas")
        this.canvas.width = DarknessMask.size
        this.canvas.height = DarknessMask.size
        this.context = this.canvas.getContext("2d")

        this.reset(0, 0)

        // pre-populate the cache with expected light sizes
        for (let i = 1; i <= Campfire.LOG_CAPACITY; i++) {
            this.populateBitmapCache(Campfire.getLightSizeForLogCount(i))
        }
        this.populateBitmapCache(Lantern.DIAMETER)
        this.populateBitmapCache(Dude.ON_FIRE_LIGHT_DIAMETER)
        Torch.DIAMETERS.forEach((d) => this.populateBitmapCache(d))
    }

    private populateBitmapCache(diameter: number) {
        const diameters = [
            diameter,
            this.getInnerCircleDiameter(diameter),
            diameter * DarknessMask.VISIBILITY_MULTIPLIER,
            this.getInnerCircleDiameter(diameter * DarknessMask.VISIBILITY_MULTIPLIER),
        ]
        diameters.forEach(this.createImageBitmap)
    }

    // constants for time of day
    static readonly SUNRISE_START = 5 * TimeUnit.HOUR
    private static readonly SUNRISE_END = 5.5 * TimeUnit.HOUR
    private static readonly SUNSET_START = 20.5 * TimeUnit.HOUR
    static readonly SUNSET_END = 21 * TimeUnit.HOUR

    // constants for light rendering
    static readonly VISIBILITY_MULTIPLIER = 2.25
    private static readonly PLAYER_VISIBLE_SURROUNDINGS_DIAMETER = 150
    private static readonly VISIBILE_LIGHT = 0.95
    private static readonly VISIBILE_LIGHT_EDGE = 0.975

    /**
     * @param time the world time
     * @param darknessLevel darkness level in range [0, 1] for non-nighttime darkness
     */
    reset(time: number, darknessLevel: number | undefined) {
        this.circleQueue = []
        this.updateColorForTime(time, darknessLevel)
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

    private getPercentTransitioned = (current: number, start: number, end: number) => {
        const val = (current - start) / (end - start)
        return Math.min(Math.max(val, 0), 1)
    }

    private readonly NIGHT_COLOR = this.colorFromString(Color.BLACK, 1)
    private readonly SUNRISE_COLOR = this.colorFromString(Color.PINK_3, 0.5)
    private readonly DAY_COLOR = this.colorFromString(Color.PINK_4, 0)
    // TODO add alternate day colors during weather
    // private readonly DAY_COLOR = this.colorFromString(Color.BLUE_2, 0.5)
    private readonly SUNSET_COLOR = this.colorFromString(Color.BLUE_4, 0.3)

    private updateColorForTime(time: number, darknessLevel: number | undefined) {
        const timeOfDay = time % TimeUnit.DAY

        let rgba: RGBA

        if (timeOfDay >= DarknessMask.SUNRISE_START && timeOfDay < DarknessMask.SUNRISE_END) {
            const pct = this.getPercentTransitioned(
                timeOfDay,
                DarknessMask.SUNRISE_START,
                DarknessMask.SUNRISE_END
            )
            rgba = this.lerpColorStrings(this.NIGHT_COLOR, this.SUNRISE_COLOR, this.DAY_COLOR, pct)
        } else if (timeOfDay >= DarknessMask.SUNRISE_END && timeOfDay < DarknessMask.SUNSET_START) {
            rgba = this.DAY_COLOR
        } else if (timeOfDay >= DarknessMask.SUNSET_START && timeOfDay < DarknessMask.SUNSET_END) {
            const pct = this.getPercentTransitioned(
                timeOfDay,
                DarknessMask.SUNSET_START,
                DarknessMask.SUNSET_END
            )
            rgba = this.lerpColorStrings(this.DAY_COLOR, this.SUNSET_COLOR, this.NIGHT_COLOR, pct)
        } else {
            rgba = this.NIGHT_COLOR
        }

        if (darknessLevel > 0) {
            rgba = this.lerpColorString(rgba, this.NIGHT_COLOR, darknessLevel)
        }

        if (debug.nightVision && this.allowNightVision) {
            rgba = this.colorFromString(Color.BLUE_3, 0.85)
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

    private lerpColorStrings(
        start: RGBA,
        midpoint: RGBA,
        end: RGBA,
        percentTransitioned: number
    ): RGBA {
        if (percentTransitioned < 0.5) {
            return this.lerpColorString(start, midpoint, percentTransitioned * 2)
        } else {
            return this.lerpColorString(midpoint, end, percentTransitioned * 2 - 1)
        }
    }

    private lerpColorString(color1: RGBA, color2: RGBA, percentTransitioned: number): RGBA {
        const lerp = (a: number, b: number) => a + (b - a) * percentTransitioned

        const r = lerp(color1.r, color2.r)
        const g = lerp(color1.g, color2.g)
        const b = lerp(color1.b, color2.b)
        const a = lerp(color1.a, color2.a)

        return { r, g, b, a }
    }

    addFaintLightCircle(position: Point, diameterMultiplier: number) {
        this.makeLightCircle(
            position,
            diameterMultiplier * DarknessMask.PLAYER_VISIBLE_SURROUNDINGS_DIAMETER,
            DarknessMask.VISIBILE_LIGHT,
            DarknessMask.VISIBILE_LIGHT_EDGE
        )
    }

    addLightCircle(centerPos: Point, diameter: number) {
        this.makeLightCircle(centerPos, diameter, 0, this.darkness / 2)
        this.makeLightCircle(
            centerPos,
            diameter * DarknessMask.VISIBILITY_MULTIPLIER,
            DarknessMask.VISIBILE_LIGHT,
            DarknessMask.VISIBILE_LIGHT_EDGE
        )
    }

    private makeLightCircle(
        centerPos: Point,
        diameter: number,
        innerAlpha: number,
        outerAlpha: number
    ) {
        if (this.darkness === 0) {
            return
        }

        const circleOffset = pt(-0.5 * diameter)
        const adjustedPos = centerPos.plus(DarknessMask.shift).plus(circleOffset).apply(Math.floor)

        this.addCircleToQueue(diameter, adjustedPos, outerAlpha)

        const innerDiameter = this.getInnerCircleDiameter(diameter)
        const innerPos = adjustedPos.plus(pt((diameter - innerDiameter) / 2)).apply(Math.floor)
        this.addCircleToQueue(innerDiameter, innerPos, innerAlpha)
    }

    private getInnerCircleDiameter(diameter: number) {
        const innerOffset = Math.floor(diameter / 8)
        return diameter - innerOffset * 2
    }

    // position is top left
    private circleQueue: { diameter: number; position: Point; alpha: number }[] = []

    /**
     * Queues a light to be rendered
     */
    private addCircleToQueue(diameter: number, position: Point, alpha: number) {
        this.circleQueue.push({ diameter, position, alpha })
    }

    private imageRender: ImageRender | undefined
    offset: Point = Point.ZERO

    update(updateData: UpdateData) {
        // prevent tint not extending to the edge
        const _dimensions = updateData.dimensions.plus(pt(1))

        if (this.darkness > 0) {
            // bitmaps are rendered async
            const missingBitmaps = this.circleQueue
                .map(({ diameter }) => diameter)
                .filter((diameter) => !DarknessMask.circleCache.get(diameter))

            if (missingBitmaps.length > 0) {
                missingBitmaps.forEach(this.createImageBitmap)
            } else {
                // sort in decreasing order of alpha (most opaque => most transparent) to draw properly
                this.circleQueue.sort((a, b) => b.alpha - a.alpha)
                this.circleQueue.forEach((circle) => this.drawCircleToCanvas(circle))
            }

            // overlay the time-specific color
            this.context.globalCompositeOperation = "source-in"
            this.context.fillStyle = this.color
            this.context.globalAlpha = this.darkness
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        this.imageRender = new ImageRender(
            this.canvas,
            this.offset.plus(DarknessMask.shift).apply(Math.floor),
            _dimensions,
            this.offset.apply(Math.floor),
            _dimensions,
            DarknessMask.DEPTH
        )
    }

    getRenderMethods() {
        return [this.imageRender]
    }

    private drawCircleToCanvas({
        diameter,
        position,
        alpha,
    }: {
        diameter: number
        position: Point
        alpha: number
    }) {
        const circleBitmap = DarknessMask.circleCache.get(diameter)

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
        const center = pt(diameter / 2 - 0.5)
        const imageBuffer: number[] = Lists.repeat(diameter * diameter, [...getRGB(Color.BLACK), 0])
        for (let x = 0; x < diameter; x++) {
            for (let y = 0; y < diameter; y++) {
                const alphaIndex = (x + y * diameter) * 4 + 3
                const pt = new Point(x, y)
                imageBuffer[alphaIndex] = pt.distanceTo(center) < diameter / 2 ? 255 : 0
            }
        }
        const imageData = new ImageData(new Uint8ClampedArray(imageBuffer), diameter, diameter)
        createImageBitmap(imageData).then((bitmap) => {
            DarknessMask.circleCache.set(diameter, bitmap)
        })
    }
}

type RGBA = {
    r: number
    g: number
    b: number
    a: number
}
