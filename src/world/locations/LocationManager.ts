import { Point, pt } from "brigsby/dist"
import { measure } from "brigsby/dist/Profiler"
import { WorldAudioContext } from "../../audio/WorldAudioContext"
import { DudeType } from "../../characters/DudeType"
import { Enemy } from "../../characters/types/Enemy"
import { Camera } from "../../cutscenes/Camera"
import { CutscenePlayerController } from "../../cutscenes/CutscenePlayerController"
import { Particles } from "../../graphics/particles/Particles"
import { session } from "../../online/session"
import { syncFn } from "../../online/syncUtils"
import { SaveContext } from "../../SaveManager"
import { LocationManagerSaveState } from "../../saves/LocationManagerSaveState"
import { LocationSaveState } from "../../saves/LocationSaveState"
import { Singletons } from "../../Singletons"
import { HUD } from "../../ui/HUD"
import { ElementType } from "../elements/Elements"
import { Simulatable } from "../Simulatable"
import { TimeUnit } from "../TimeUnit"
import { VisibleRegionMask } from "../VisibleRegionMask"
import { Location } from "./Location"

export enum LocationType {
    BASE_CAMP = "base",
    TENT_INTERIOR = "tent",
    MINE_INTERIOR = "mine",
    HOUSE_INTERIOR = "house",
    CHUCH_INTERIOR = "church",
    APOTHECARY_INTERIOR = "apothecary",
    RADIANT = "radiant",
}

export class LocationManager {
    static get instance() {
        return Singletons.getOrCreate(LocationManager)
    }

    constructor() {
        window["locationManager"] = this
        window["here"] = {
            uuid: () => here().uuid,

            listDudes: () => {
                const ids = {}
                here()
                    .getDudes()
                    .forEach((d) => {
                        const type = DudeType[d.type]
                        ids[type] = ids[type] || []
                        ids[type].push(d.uuid)
                    })
                console.log(ids)
            },

            kill: (type: DudeType) => {
                here()
                    .getDudes()
                    .filter((d) => d.type === type)
                    .forEach((d) => d.damage(Number.MAX_SAFE_INTEGER))
            },

            killEnemies: () => {
                here()
                    .getDudes()
                    .forEach((d) => {
                        if (d.entity.getComponent(Enemy)) {
                            d.damage(Number.MAX_SAFE_INTEGER)
                        }
                    })
            },

            bulldoze: (type: ElementType) => {
                here()
                    .getElementsOfType(type)
                    .forEach((el) => here().removeElementLocally(el))
            },

            listElements: (type: ElementType) => {
                console.log(here().getElementsOfType(type))
            },
        }
    }

    /**
     * @deprecated use here() instead
     */
    current() {
        return this.currentLocation
    }
    loadLocation(newLocation: Location) {
        WorldAudioContext.instance.isInterior = newLocation.isInterior
        this.currentLocation?.toggleAudio(false)
        newLocation.toggleAudio(true)
        this.currentLocation = newLocation
        this.simulateLocations(false, TimeUnit.MINUTE)
    }
    private currentLocation: Location

    private locations: Map<string, Location> = new Map() // uuid -> location

    get(uuid: string) {
        return this.locations.get(uuid)
    }

    add(location: Location) {
        this.locations.set(location.uuid, location)
        if (!this.currentLocation) {
            this.loadLocation(location)
        }
        this.syncIntializeLocation(location.save("multiplayer"))
        return location
    }

    // MPTODO
    delete(location: Location) {
        this.locations.delete(location.uuid)
    }

    /**
     * @deprecated use camp() instead
     */
    exterior(): Location {
        if (!this.ext) {
            // TODO do this in a less hacky fashion
            this.ext = Array.from(this.locations.values()).find(
                (l) => l.type === LocationType.BASE_CAMP
            )
        }
        return this.ext
    }
    private ext: Location

    getLocations(): Location[] {
        return Array.from(this.locations.values())
    }

    save(context: SaveContext): LocationManagerSaveState {
        return {
            values: Array.from(this.locations.values()).map((l) => l.save(context)),
            currentLocationUUID: this.currentLocation.uuid,
        }
    }

    private syncIntializeLocation = syncFn("lm:sil", (l: LocationSaveState) => {
        if (!session.isHost()) {
            this.initializeLocation(l)
        }
    })

    private initializeLocation(l: LocationSaveState) {
        const loadedLocation = Location.load(l)
        this.locations.set(l.uuid, loadedLocation)
    }

    initialize(saveState: LocationManagerSaveState) {
        this.locations = new Map()
        saveState.values.forEach((l) => this.initializeLocation(l))
        this.loadLocation(this.locations.get(saveState.currentLocationUUID))
    }

    simulateLocations(simulateCurrentLocation: boolean, duration: number) {
        if (session.isHost()) {
            const [time] = measure(() => {
                this.getLocations()
                    .filter((l) => simulateCurrentLocation || l !== this.currentLocation)
                    .flatMap((l) => l.getEntities())
                    .forEach((e) =>
                        e.getComponents(Simulatable).forEach((s) => s.simulate(duration))
                    )
            })
        }
        // console.log(`simulation took ${time} milliseconds`)
    }

    /**
     * This function is only called on the host
     * @param newLocation
     * @param newPosition The pixel position of the player
     */
    playerLoadLocation(
        newLocation: Location,
        newPosition: Point,
        afterTransitionCallback?: () => void
    ) {
        this.playerLoadLocal(
            newLocation.uuid,
            newPosition.x,
            newPosition.y,
            session.isHost() ? afterTransitionCallback : undefined
        )
    }

    /**
     * @param afterTransitionCallback Only should be supplied host-side!
     */
    private playerLoadLocal = syncFn(
        "lm:pll",
        (uuid: string, px: number, py: number, afterTransitionCallback?: () => void) => {
            const newLocation = this.get(uuid)
            const newPosition = pt(px, py)

            CutscenePlayerController.instance.enable()

            // load a new location
            HUD.instance.locationTransition.transition(() => {
                // move the players to the new location's dude store
                const oldLocation = here()

                oldLocation
                    .getDudes()
                    .filter((d) => d.type === DudeType.PLAYER)
                    .forEach((p) => {
                        oldLocation.removeDude(p)
                        newLocation.addDude(p)
                        p.location = newLocation
                        p.moveTo(newPosition, true)
                    })

                // refresh the HUD hide stale data
                HUD.instance.refresh()

                // actually set the location
                this.loadLocation(newLocation)

                // delete existing particles
                Particles.instance.clear()

                // clip edges of all locations
                VisibleRegionMask.instance.refresh()

                // position the player and camera
                Camera.instance.jumpCutToFocalPoint()

                setTimeout(() => {
                    CutscenePlayerController.instance.disable()

                    if (afterTransitionCallback) {
                        afterTransitionCallback()
                    }
                }, 400)
            })
        }
    )
}

export const camp = () => LocationManager.instance.exterior()
export const here = () => LocationManager.instance.current()
