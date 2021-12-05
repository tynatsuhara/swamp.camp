import { Component } from "brigsby/dist/Component"
import { Entity } from "brigsby/dist/Entity"
import { Point } from "brigsby/dist/Point"
import { Player } from "../characters/Player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { DarknessMask } from "./DarknessMask"
import { Location } from "./Location"
import { camp, LocationManager } from "./LocationManager"
import { TimeUnit } from "./TimeUnit"
import { Vignette } from "./Vignette"
import { WorldTime } from "./WorldTime"

export class LightManager extends Component {
    static get instance() {
        return Singletons.getOrCreate(LightManager)
    }

    private lightTiles: Map<Location, Map<any, [Point, number]>> = new Map<
        Location,
        Map<any, [Point, number]>
    >()
    private mask = new DarknessMask(true)

    private vignette: Vignette

    /**
     * @param key the unique key for location, will overwrite that light source if it already exists
     */
    addLight(wl: Location, key: any, pixelPosition: Point, diameter: number = 16) {
        if (diameter % 4 !== 0) {
            throw new Error("only circle with a diameter multiple of 4 works")
        }
        const locationLightMap = this.lightTiles.get(wl) ?? new Map()
        locationLightMap.set(key, [pixelPosition, diameter])
        this.lightTiles.set(wl, locationLightMap)
    }

    removeLight(wl: Location, key: any) {
        const locationLightMap = this.lightTiles.get(wl)
        if (!locationLightMap) {
            return // it is ok to fail silently here
        }
        locationLightMap.delete(key)
    }

    /**
     * returns true if it is dark enough for a demon to tolerate
     */
    isDark = (pixelPt: Point, location: Location = LocationManager.instance.currentLocation) =>
        this.isDarkHelper(pixelPt, location, 1)

    isTotalDarkness = (
        pixelPt: Point,
        location: Location = LocationManager.instance.currentLocation
    ) => this.isDarkHelper(pixelPt, location, DarknessMask.VISIBILITY_MULTIPLIER)

    /**
     * currently this is O(n) for n light sources in a location — don't call on every update()
     */
    private isDarkHelper(
        pixelPt: Point,
        location: Location,
        tolerableDistanceFromLightMultiplier: number
    ): boolean {
        const time = WorldTime.instance.time % TimeUnit.DAY
        if (time >= DarknessMask.SUNRISE_START && time < DarknessMask.SUNSET_END) {
            return false // daytime
        }
        const locationLightMap = this.lightTiles.get(location)
        if (!locationLightMap) {
            return true // nighttime with no lights
        }
        return !Array.from(locationLightMap.values()).some(
            (entry) =>
                entry[0].distanceTo(pixelPt) < entry[1] * 0.5 * tolerableDistanceFromLightMultiplier
        )
    }

    private render() {
        // lazy load the vignette
        if (!this.vignette) {
            this.vignette = new Entity().addComponent(
                new Vignette(
                    new Point(1, 1).times((-camp().size / 2) * TILE_SIZE),
                    camp().size * TILE_SIZE
                )
            )
        }

        const location = LocationManager.instance.currentLocation
        this.mask.reset(WorldTime.instance.time)

        // Always provide slight visibility around the player
        const player = Player.instance?.dude
        if (!!player) {
            if (player.shieldType !== ShieldType.LANTERN) {
                this.mask.addFaintLightCircle(
                    player.standingPosition
                        .plusY(-TILE_SIZE / 2)
                        .plus(player.getAnimationOffsetPosition())
                )
            }
        }

        const locationLightGrid = this.lightTiles.get(location)
        if (!locationLightGrid) {
            return
        }

        Array.from(locationLightGrid.values()).forEach((entry) => {
            this.mask.addLightCircle(entry[0], entry[1])
        })
    }

    awake() {
        this.update()
    }

    update() {
        this.render()
        this.renderedEntity = this.mask.render(Camera.instance.dimensions, Camera.instance.position)
    }

    private renderedEntity: Entity

    getEntities(): Entity[] {
        const result = [new Entity([this]), this.renderedEntity]

        const location = LocationManager.instance.currentLocation
        if (!location.isInterior) {
            result.push(this.vignette?.entity)
        }

        return result
    }
}
