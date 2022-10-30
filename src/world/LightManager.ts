import { Component, Entity, Point } from "brigsby/dist"
import { player } from "../characters/player"
import { ShieldType } from "../characters/weapons/ShieldType"
import { Camera } from "../cutscenes/Camera"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { DarknessMask } from "./DarknessMask"
import { Location } from "./locations/Location"
import { here, LocationType } from "./locations/LocationManager"
import { TimeUnit } from "./TimeUnit"
import { VisibleRegionMask } from "./VisibleRegionMask"
import { WorldTime } from "./WorldTime"

type LightCircle = {
    position: Point
    diameter: number
}

export class LightManager extends Component {
    static get instance() {
        return Singletons.getOrCreate(LightManager)
    }

    private keyLocationMap: Map<any, Location> = new Map()
    private lightTiles: Map<Location, Map<any, LightCircle>> = new Map<
        Location,
        Map<any, LightCircle>
    >()
    private mask: DarknessMask

    constructor() {
        super()
        // Set up the entity
        new Entity([this])
    }

    awake() {
        this.mask = this.entity.addComponent(new DarknessMask(true))
    }

    update() {
        this.mask.offset = Camera.instance.position
        this.render()
    }

    /**
     * @param key the unique key for location, will overwrite that light source if it already exists
     */
    addLight(wl: Location, key: any, position: Point, diameter: number = 16) {
        if (diameter % 4 !== 0) {
            throw new Error("only circle with a diameter multiple of 4 works")
        }
        if (this.keyLocationMap.has(key)) {
            this.removeLight(key)
        }
        this.keyLocationMap.set(key, wl)
        const locationLightMap = this.lightTiles.get(wl) ?? new Map<any, LightCircle>()
        locationLightMap.set(key, { position, diameter })
        this.lightTiles.set(wl, locationLightMap)
    }

    removeLight(key: any) {
        const wl = this.keyLocationMap.get(key)
        const locationLightMap = this.lightTiles.get(wl)
        if (!locationLightMap) {
            return // it is ok to fail silently here
        }
        locationLightMap.delete(key)
    }

    /**
     * @returns true if the point is at max brightness
     */
    isFullyLit = (pixelPt: Point, location: Location = here()) =>
        !this.isDarkHelper(pixelPt, location, 0.6)

    /**
     * @returns true if it is dark enough for a demon to tolerate
     */
    isDark = (pixelPt: Point, location: Location = here()) =>
        this.isDarkHelper(pixelPt, location, 1)

    isTotalDarkness = (pixelPt: Point, location: Location = here()) =>
        this.isDarkHelper(pixelPt, location, DarknessMask.VISIBILITY_MULTIPLIER)

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
            ({ position, diameter }) =>
                position.distanceTo(pixelPt) < diameter * 0.5 * tolerableDistanceFromLightMultiplier
        )
    }

    private getLocationDarkness() {
        const location = here()

        // Get dark when approaching the edge of the map
        // if (location === camp()) {
        //     const pos = Player.instance.dude.standingPosition
        //     const buffer = TILE_SIZE * 8
        //     const fullDarknessBuffer = TILE_SIZE * 2
        //     const margin = (camp().size / 2) * TILE_SIZE - buffer - fullDarknessBuffer
        //     let darkness = 0
        //     if (pos.x < -margin) {
        //         darkness = Math.max(darkness, Maths.clamp((pos.x + margin) / -buffer, 0, 1))
        //     }
        //     if (pos.y < -margin) {
        //         darkness = Math.max(darkness, Maths.clamp((pos.y + margin) / -buffer, 0, 1))
        //     }
        //     if (pos.y > margin) {
        //         darkness = Math.max(darkness, Maths.clamp((pos.y - margin) / buffer, 0, 1))
        //     }
        //     return darkness
        // }

        if (location.type === LocationType.MINE_INTERIOR) {
            return 0.99
        }
    }

    private render() {
        this.mask.reset(WorldTime.instance.time, this.getLocationDarkness())

        // Always provide slight visibility around the player
        const p = player()?.dude
        if (p) {
            if (p.shieldType !== ShieldType.LANTERN) {
                this.mask.addFaintLightCircle(
                    p.standingPosition.plusY(-TILE_SIZE / 2).plus(p.getAnimationOffset()),
                    here().isInterior ? 0.5 : 1
                )
            }
        }

        const locationLightGrid = this.lightTiles.get(here())
        if (!locationLightGrid) {
            return
        }

        Array.from(locationLightGrid.values()).forEach(({ position, diameter }) => {
            this.mask.addLightCircle(position, diameter)
        })
    }

    getEntities(): Entity[] {
        const result = [this.entity]

        const location = here()
        if (!location.isInterior) {
            result.push(VisibleRegionMask.instance.entity)
        }

        return result
    }
}
