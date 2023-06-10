import { expose, Point, PointValue, pt } from "brigsby/dist"
import { measure } from "brigsby/dist/Profiler"
import { WorldAudioContext } from "../../audio/WorldAudioContext"
import { Dude } from "../../characters/Dude"
import { DudeType } from "../../characters/DudeType"
import { Enemy } from "../../characters/types/Enemy"
import { SaveContext } from "../../core/SaveManager"
import { Singletons } from "../../core/Singletons"
import { Camera } from "../../cutscenes/Camera"
import { Particles } from "../../graphics/particles/Particles"
import { session } from "../../online/session"
import { syncFn } from "../../online/syncUtils"
import { LocationManagerSaveState } from "../../saves/LocationManagerSaveState"
import { LocationSaveState } from "../../saves/LocationSaveState"
import { HUD } from "../../ui/HUD"
import { ElementType } from "../elements/ElementType"
import { Simulatable } from "../Simulatable"
import { Teleporters, TeleporterSide, TeleporterSound, TeleporterV2 } from "../Teleporter"
import { TimeUnit } from "../TimeUnit"
import { VisibleRegionMask } from "../VisibleRegionMask"
import { BasicLocation } from "./BasicLocation"
import { Location } from "./Location"
import { LocationType } from "./LocationType"

export class LocationManager {
    static get instance() {
        return Singletons.getOrCreate(LocationManager)
    }

    private currentLocation: Location
    private locations: Map<string, Location> = new Map() // uuid -> location
    private _camp: Location
    private teleporters: Record<string, TeleporterV2> = {}

    constructor() {
        expose({
            locationManager: this,
            here: {
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

                bulldoze: (type: ElementType, pct = 1) => {
                    here()
                        .getElementsOfType(type)
                        .forEach((el) => {
                            if (Math.random() < pct) {
                                here().removeElementLocally(el)
                            }
                        })
                },

                listElements: (type: ElementType) => {
                    console.log(here().getElementsOfType(type))
                },
            },
        })
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

    delete(location: Location) {
        this.locations.delete(location.uuid)
    }

    /**
     * @deprecated use camp() instead
     */
    campLocation(): Location {
        if (!this._camp) {
            this._camp = Array.from(this.locations.values()).find(
                (l) => l.type === LocationType.BASE_CAMP
            )
        }
        return this._camp
    }

    getLocations(): Location[] {
        return Array.from(this.locations.values())
    }

    save(context: SaveContext): LocationManagerSaveState {
        return {
            values: Array.from(this.locations.values()).map((l) => l.save(context)),
            currentLocationUUID: this.currentLocation.uuid,
            teleporters: this.teleporters,
        }
    }

    private syncIntializeLocation = syncFn("lm:sil", (l: LocationSaveState) => {
        if (!session.isHost()) {
            this.initializeLocation(l)
        }
    })

    private initializeLocation(l: LocationSaveState) {
        // TODO clean this up when we add different location types
        const loadedLocation = BasicLocation.load(l)
        this.locations.set(l.uuid, loadedLocation)
    }

    initialize(saveState: LocationManagerSaveState) {
        this.locations = new Map()
        this.teleporters = saveState.teleporters
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

            const transitionCallback = () => {
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
            }

            // load a new location
            HUD.instance.locationTransition.transition({
                transitionCallback,
                afterTransitionCallback,
            })
        }
    )

    getTeleportersHere(): PointValue[] {
        return Object.values(this.teleporters)
            .map((tp) => {
                if (tp.a.location === this.currentLocation.uuid) {
                    return tp.a
                } else if (tp.b.location === this.currentLocation.uuid) {
                    return tp.b
                }
            })
            .filter((side) => !!side)
            .map((side) => side.pos)
    }

    setTeleporter(id: string, side: "a" | "b", data: TeleporterSide, sound?: TeleporterSound) {
        this.teleporters[id] ??= {}
        this.teleporters[id][side] = data
        // only one of the sides needs to set the sound
        // this makes it simpler since interiors have custom logic but exteriors don't
        this.teleporters[id].sound ??= sound
    }

    findTeleporter(
        from: string,
        to: string
    ): { id: string; source: TeleporterSide; dest: TeleporterSide } {
        return Object.entries(this.teleporters)
            .map(([id, tp]) => {
                if (tp.a.location === from && tp.b.location === to) {
                    return { id, source: tp.a, dest: tp.b }
                } else if (tp.a.location === from && tp.b.location === to) {
                    return { id, source: tp.b, dest: tp.a }
                } else {
                    return undefined
                }
            })
            .find((result) => !!result)
    }

    playerUseTeleporter(teleporterId: string) {
        // teleporter will get executed on the host
        if (session.isGuest()) {
            return
        }

        const teleporter = this.teleporters[teleporterId]
        const otherSide = teleporter.a.location === here().uuid ? teleporter.b : teleporter.a

        this.playerLoadLocation(
            LocationManager.instance.get(otherSide.location),
            pt(otherSide.pos.x, otherSide.pos.y)
        )

        setTimeout(() => Teleporters.playSound(teleporter), 500)
    }

    npcUseTeleporter(dude: Dude, teleporterId: string) {
        const teleporter = this.teleporters[teleporterId]
        const currentSide = teleporter.a.location === here().uuid ? teleporter.a : teleporter.b
        const currentLocation = this.get(currentSide.location)
        const otherSide = currentSide === teleporter.a ? teleporter.b : teleporter.a
        const otherLocation = this.get(otherSide.location)

        currentLocation.removeDude(dude)
        otherLocation.addDude(dude)
        dude.location = otherLocation

        dude.moveTo(pt(otherSide.pos.x, otherSide.pos.y), true)
    }
}

export const camp = () => LocationManager.instance.campLocation()
export const here = () => LocationManager.instance.current()
