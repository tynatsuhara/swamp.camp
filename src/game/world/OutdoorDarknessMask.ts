import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { BasicRenderComponent } from "../../engine/renderer/BasicRenderComponent"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { UIStateManager } from "../ui/UIStateManager"
import { LocationManager } from "./LocationManager"
import { MapGenerator } from "./MapGenerator"
import { TimeUnit } from "./TimeUnit"
import { Vignette } from "./Vignette"
import { WorldLocation } from "./WorldLocation"
import { WorldTime } from "./WorldTime"

export class OutdoorDarknessMask {

    private static _instance: OutdoorDarknessMask
    static get instance(): OutdoorDarknessMask {
        if (!this._instance) {
            this._instance = new OutdoorDarknessMask()
        }
        return this._instance
    }

    private constructor() {
        OutdoorDarknessMask._instance = this
    }

    // no lights should live outside of this range
    private size = MapGenerator.MAP_SIZE * TILE_SIZE
    private shift = new Point(this.size/2, this.size/2)

    // for each location, map key to (position, diameter)
    private lightTiles: Map<WorldLocation, Map<any, [Point, number]>> = new Map<WorldLocation, Map<any, [Point, number]>>()
    private color: string
    private darkness = 0.4

    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    start() {
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.size
        this.canvas.height = this.size
        this.context = this.canvas.getContext("2d")
    }

    /**
     * @param key the unique key for location, will overwrite that light source if it already exists
     */
    addLight(wl: WorldLocation, key: any, position: Point, diameter: number = 16) {
        if (diameter % 2 !== 0) {
            throw new Error("only even circle px diameters work right now")
        }
        this.checkPt(position)
        const locationLightMap = this.lightTiles.get(wl) ?? new Map()
        locationLightMap.set(key, [position, diameter])
        this.lightTiles.set(wl, locationLightMap)
    }

    removeLight(wl: WorldLocation, key: any) {
        const locationLightMap = this.lightTiles.get(wl)
        if (!locationLightMap) {
            return  // it is ok to fail silently here
        }
        locationLightMap.delete(key)
    }

    /**
     * returns true if it is dark enough for a demon to tolerate
     */
    isDark(pixelPt: Point): boolean {
        if (this.darkness < .6) {
            return false
        }
        const locationLightMap = this.lightTiles.get(LocationManager.instance.currentLocation)
        if (!locationLightMap) {
            return true
        }
        // TODO optimize this pre-computing light values in a grid, this will get expensive as we add more lights
        return !Array.from(locationLightMap.values()).some(entry => entry[0].distanceTo(pixelPt) < entry[1] * .5)
    }

    private updateColorForTime() {
        const time = WorldTime.instance.time
        const hour = (time % TimeUnit.DAY) / TimeUnit.HOUR
		const timeSoFar = time % TimeUnit.HOUR
		const clamp01 = (val) => Math.min(Math.max(val, 0), 1)

        const nightColor = this.colorFromString(Color.BLACK, 1)
        const sunriseColor = this.colorFromString(Color.PINK, 0.2)
        const dayColor = this.colorFromString(Color.LIGHT_PINK, 0)
        const sunsetColor = this.colorFromString(Color.DARK_PURPLE, 0.2)
        const transitionTime = TimeUnit.HOUR

        // TODO: make these transitions quicker
        if (hour >= 5 && hour < 6) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 5) * TimeUnit.HOUR)/transitionTime)
			this.lerpColorString(nightColor, sunriseColor, percentTransitioned) // sunrise		
		} else if (hour >= 6 && hour < 20) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 6) * TimeUnit.HOUR)/transitionTime)
			this.lerpColorString(sunriseColor, dayColor, percentTransitioned)   // day	
		} else if (hour >= 20 && hour < 21) {
			const percentTransitioned = clamp01((timeSoFar + (hour - 20) * TimeUnit.HOUR)/transitionTime)			
			this.lerpColorString(dayColor, sunsetColor, percentTransitioned)    // sunset
		} else {
			const percentTransitioned = clamp01((timeSoFar + (24 + hour - 21) % 24 * TimeUnit.HOUR)/transitionTime)			
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

    private checkPt(position) {
        const lim = this.size/2
        if (position.x < -lim || position.x > lim || position.y < -lim || position.y > lim) {
            throw new Error("light is outside of valid bounds")
        }
    }

    private static readonly PLAYER_VISIBLE_SURROUNDINGS_DIAMETER = 150
    private static readonly VISIBILE_LIGHT = .95
    private static readonly VISIBILE_LIGHT_EDGE = .975
    private static readonly VISIBILITY_MULTIPLIER = 2.25

    private renderToOffscreenCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const location = LocationManager.instance.currentLocation
        if (this.darkness === 0) {
            return
        }
        
        this.updateColorForTime()
        this.context.fillStyle = this.color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Always provide slight visibility around the player
        const player = Player.instance?.dude
        if (!!player) {
            if (player.shieldType !== ShieldType.LANTERN) {
                this.makeLightCircle(
                    player.standingPosition.plusY(-TILE_SIZE/2).plus(player.getAnimationOffsetPosition()), 
                    OutdoorDarknessMask.PLAYER_VISIBLE_SURROUNDINGS_DIAMETER, 
                    OutdoorDarknessMask.VISIBILE_LIGHT, 
                    OutdoorDarknessMask.VISIBILE_LIGHT_EDGE
                )
            }
        }

        const locationLightGrid = this.lightTiles.get(location)
        if (!locationLightGrid) {
            return
        }

        Array.from(locationLightGrid.values()).forEach(entry => {
            // actual light
            this.makeLightCircle(entry[0], entry[1], 0, this.darkness/2)
            // barely-visible region
            this.makeLightCircle(
                entry[0], 
                entry[1] * OutdoorDarknessMask.VISIBILITY_MULTIPLIER, 
                OutdoorDarknessMask.VISIBILE_LIGHT, 
                OutdoorDarknessMask.VISIBILE_LIGHT_EDGE
            )
        })
    }

    private makeLightCircle(centerPos: Point, diameter: number, innerAlpha: number, outerAlpha: number) {
        const circleOffset = new Point(-.5, -.5).times(diameter)
        const adjustedPos = centerPos.plus(this.shift).plus(circleOffset)
        
        this.makeLightCircleHelper(diameter, adjustedPos, outerAlpha)

        const innerOffset = Math.floor(diameter/2 * 1/4)
        this.makeLightCircleHelper(diameter-innerOffset*2, adjustedPos.plus(new Point(innerOffset, innerOffset)), innerAlpha)
    }

    private makeLightCircleHelper(diameter: number, position: Point, alpha: number) {
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

    private vignetteEntity = new Entity([new Vignette(new Point(1, 1).times(-this.size/2), this.size)])

    getEntities(): Entity[] {
        this.renderToOffscreenCanvas()

        // prevent tint not extending to the edge
        const dimensions = Camera.instance.dimensions.plus(new Point(1, 1))

        const dynamicDarknessEntity = new Entity([new BasicRenderComponent(new ImageRender(
            this.canvas,
            Camera.instance.position.plus(this.shift).apply(Math.floor),
            dimensions,
            Camera.instance.position.apply(Math.floor),
            dimensions,
            UIStateManager.UI_SPRITE_DEPTH - 100  // make sure all UI goes on top of light
        ))])

        const result = [dynamicDarknessEntity]

        const location = LocationManager.instance.currentLocation
        if (!location.isInterior) {
            result.push(this.vignetteEntity)
        }
        
        return result
    }
}