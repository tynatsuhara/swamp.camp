import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { DarknessMask } from "./DarknessMask"
import { LocationManager } from "./LocationManager"
import { MapGenerator } from "./MapGenerator"
import { Vignette } from "./Vignette"
import { WorldLocation } from "./WorldLocation"
import { WorldTime } from "./WorldTime"

export class LightManager {

    private static _instance: LightManager
    static get instance(): LightManager {
        if (!this._instance) {
            this._instance = new LightManager()
        }
        return this._instance
    }

    private lightTiles: Map<WorldLocation, Map<any, [Point, number]>> = new Map<WorldLocation, Map<any, [Point, number]>>()
    private mask = new DarknessMask()

    private vignetteEntity = new Entity([new Vignette(
        new Point(1, 1).times(-MapGenerator.MAP_SIZE/2 * TILE_SIZE), 
        MapGenerator.MAP_SIZE * TILE_SIZE
    )])

    /**
    * @param key the unique key for location, will overwrite that light source if it already exists
    */
    addLight(wl: WorldLocation, key: any, position: Point, diameter: number = 16) {
        if (diameter % 2 !== 0) {
            throw new Error("only even circle px diameters work right now")
        }
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
    isDark = (pixelPt: Point) => this.testDarkness(pixelPt, 1)
    isTotalDarkness = (pixelPt: Point) => this.testDarkness(pixelPt, DarknessMask.VISIBILITY_MULTIPLIER)
 
    private testDarkness(pixelPt: Point, tolerableDistanceFromLightMultiplier: number): boolean {
        if (this.mask.getDarkness() < .6) {
            return false
        }
        const locationLightMap = this.lightTiles.get(LocationManager.instance.currentLocation)
        if (!locationLightMap) {
            return true
        }
        return !Array.from(locationLightMap.values()).some(entry => 
            entry[0].distanceTo(pixelPt) < entry[1] * .5 * tolerableDistanceFromLightMultiplier
        )
    }

    private render() {
        const location = LocationManager.instance.currentLocation
        this.mask.reset(WorldTime.instance.time)
        
        // Always provide slight visibility around the player
        const player = Player.instance?.dude
        if (!!player) {
            if (player.shieldType !== ShieldType.LANTERN) {
                this.mask.addFaintLightCircle(
                    player.standingPosition.plusY(-TILE_SIZE/2).plus(player.getAnimationOffsetPosition())
                )
            }
        }

        const locationLightGrid = this.lightTiles.get(location)
        if (!locationLightGrid) {
            return
        }

        Array.from(locationLightGrid.values()).forEach(entry => {
            this.mask.addLightCircle(entry[0], entry[1])
        })
    }

    getEntities(): Entity[] {
        this.render()

        const result = [this.mask.getEntity(Camera.instance.dimensions, Camera.instance.position)]

        const location = LocationManager.instance.currentLocation
        if (!location.isInterior) {
            result.push(this.vignetteEntity)
        }
        
        return result
    }
}