import { Point, pt } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util"
import { tilesAround } from "../../Utils"
import { TILE_SIZE, pixelPtToTilePt } from "../../graphics/Tilesets"
import { hash } from "../../utils/hash"
import { DarknessMask } from "../../world/DarknessMask"
import { LightManager } from "../../world/LightManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { ConstructionSite } from "../../world/buildings/ConstructionSite"
import { Campfire } from "../../world/elements/Campfire"
import { ElementType } from "../../world/elements/ElementType"
import { ElementUtils } from "../../world/elements/ElementUtils"
import { Tree } from "../../world/elements/Tree"
import { Location } from "../../world/locations/Location"
import { LocationManager, camp } from "../../world/locations/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"
import { Villager } from "../types/Villager"
import { ShieldType } from "../weapons/ShieldType"
import { WeaponType } from "../weapons/WeaponType"
import { NPCSchedules } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext, RoamOptions, WalkToOptions } from "./NPCTaskContext"
import { VillagerJob } from "./VillagerJob"

export class NPCTaskScheduleDefaultVillager extends NPCTask {
    private closestFirePosition: Point
    private homeLocation: Location
    private workLocation: Location

    private workRoamingSpots: Point[] | undefined

    constructor(private readonly npc: NPC) {
        super()
        this.closestFirePosition = this.getClosestFire(npc)
        this.homeLocation = this.findHomeLocation(npc.dude)
        this.workLocation = this.findWorkLocation(npc.dude)
        if (this.getJob() === VillagerJob.CONSTRUCTION) {
            this.workRoamingSpots = this.getConstructionZoneSpots()
        }
    }

    performTask(context: NPCTaskContext): void {
        const { dude } = context
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        const { VILLAGER_WAKE_UP_TIME, VILLAGER_STOP_WORK_TIME, VILLAGER_GO_HOME_TIME } =
            NPCSchedules

        const isTimeBetween = (start: number, end: number) => timeOfDay > start && timeOfDay < end
        const shouldBeWorking = isTimeBetween(VILLAGER_WAKE_UP_TIME, VILLAGER_STOP_WORK_TIME)

        let goalLocation: Location

        const roamOptions: RoamOptions = {
            pauseEveryMillis: 2500 + 2500 * Math.random(),
            pauseForMillis: 2500 + 5000 * Math.random(),
        }

        if (shouldBeWorking) {
            if (this.getJob()) {
                this.equipJobGear()
            }

            // Are you feeling zen? If not, a staycation is what I recommend.
            // Or better yet, don't be a jerk. Unwind by being a man... and goin' to work.
            goalLocation = this.workLocation ?? camp()

            if (this.workRoamingSpots) {
                roamOptions.goalOptionsSupplier = () => this.workRoamingSpots

                const alreadyAtWorkSpot = this.workRoamingSpots.some((spot) =>
                    spot.equals(dude.tile)
                )
                if (!alreadyAtWorkSpot) {
                    // Go straight to work, no dilly-dallying
                    roamOptions.pauseEveryMillis = undefined
                    roamOptions.pauseForMillis = undefined
                }
            }
        } else {
            // Hang around camp or go home
            goalLocation = isTimeBetween(VILLAGER_STOP_WORK_TIME, VILLAGER_GO_HOME_TIME)
                ? camp()
                : this.homeLocation ?? camp()
            dude.setWeapon(WeaponType.NONE, -1)
            dude.setShield(ShieldType.NONE, -1)
        }

        if (goalLocation && dude.location !== goalLocation) {
            context.goToLocation(goalLocation)
            return
        }

        if (shouldBeWorking && this.getJob() === VillagerJob.HARVEST_WOOD) {
            const treeArgs = this.getTreeToChop()
            if (treeArgs) {
                context.walkTo(...this.getTreeToChop())
                return
            }
        }

        if (
            dude.location === camp() &&
            (timeOfDay < DarknessMask.SUNRISE_START || timeOfDay > DarknessMask.SUNSET_END)
        ) {
            // Go to a campfire if it's dark out
            this.goToClosestFire(context)
            return
        }

        // Roam around wherever they're at
        context.roam(0.5, roamOptions)
    }

    private findHomeLocation(dude: Dude) {
        const houses = camp()
            .getElements()
            .flatMap((el) => el.entity.getComponents(Residence))
            .filter((residence) => residence?.isHomeOf(dude.uuid))

        if (houses.length > 0) {
            return LocationManager.instance.get(houses[0].locationUUID)
        }
    }

    private findWorkLocation(dude: Dude): Location | undefined {
        // wfh today
        if (dude.factions.includes(DudeFaction.CLERGY) || dude.type === DudeType.DOCTOR) {
            return this.findHomeLocation(dude)
        }

        const job = this.getJob()

        if (job === VillagerJob.MINE) {
            const mines = camp()
                .getElementsOfType(ElementType.MINE_ENTRANCE)
                .map((el) => el.save().destinationUUID)

            if (mines.length === 0) {
                return
            }

            return LocationManager.instance.get(this.getWorkLocation(mines))
        } else if (
            job === VillagerJob.HARVEST_WOOD ||
            job === VillagerJob.DEFEND ||
            job === VillagerJob.CONSTRUCTION
        ) {
            return camp()
        }
    }

    private equipJobGear() {
        this.npc.dude.setWeapon(
            {
                [VillagerJob.MINE]: WeaponType.PICKAXE,
                [VillagerJob.HARVEST_WOOD]: WeaponType.AXE,
                [VillagerJob.DEFEND]: WeaponType.CLUB,
                [VillagerJob.CONSTRUCTION]: WeaponType.HAMMER,
            }[this.getJob()] ?? WeaponType.NONE,
            -1
        )
        this.npc.dude.setShield(
            {
                [VillagerJob.DEFEND]: ShieldType.BASIC,
            }[this.getJob()] ?? ShieldType.NONE,
            -1
        )
    }

    private goToClosestFire(context: NPCTaskContext) {
        if (
            LightManager.instance.isFullyLit(context.dude.standingPosition, context.dude.location)
        ) {
            context.doNothing()
            return
        }

        if (!this.closestFirePosition) {
            context.doNothing()
            return
        }

        // this works fine enough ¯\_(ツ)_/¯
        context.walkTo(this.closestFirePosition.plusY(1))
    }

    private getClosestFire(npc: NPC) {
        if (npc.dude.location !== camp()) {
            return undefined
        }

        const burningFires = npc.dude.location
            .getElementsOfType(ElementType.CAMPFIRE)
            .filter((c) => c.entity.getComponent(Campfire).isBurning)

        const closestFire = Lists.minBy(burningFires, (e) =>
            e.pos.distanceTo(npc.dude.standingPosition)
        )
        const firePos = closestFire?.pos
        if (!firePos) {
            return undefined
        }
        const lightRadius = Campfire.getLightSizeForLogCount(
            closestFire.entity.getComponent(Campfire).logs
        )
        const firePixelPtCenter = firePos.plus(pt(0.5)).times(TILE_SIZE)

        let result = firePos
        while (result.equals(firePos) || npc.dude.location.isOccupied(result)) {
            result = pixelPtToTilePt(firePixelPtCenter.randomCircularShift(lightRadius))
        }

        return result
    }

    private getConstructionZoneSpots() {
        const zones = camp()
            .getElements()
            .filter((e) => e.entity.getComponent(ConstructionSite)?.hasMaterials())

        if (zones.length === 0) {
            return null
        }

        const zoneElement = this.getWorkLocation(zones)
        const zone = zoneElement.entity.getComponent(ConstructionSite)

        return ElementUtils.rectPoints(zoneElement.pos, zone.size)
    }

    private getTreeToChop() {
        const location = camp()
        const currentInteractWithGoal = this.npc.getInteractWithGoal()

        if (
            currentInteractWithGoal &&
            location.getElement(currentInteractWithGoal)?.entity?.getComponent(Tree)?.choppable
        ) {
            return this.pickTree([currentInteractWithGoal])
        }

        const nearbyTree = this.pickTree(tilesAround(this.npc.dude.tile, 10))
        if (nearbyTree) {
            return nearbyTree
        }

        return this.pickTree()
    }

    private pickTree(pts?: Point[]) {
        const location = camp()
        const elements = pts ? pts.map((p) => location.getElement(p)) : location.getElements()

        const options = elements
            .map((el) => el?.entity?.getComponent(Tree))
            .filter((tree) => tree?.choppable)
            .flatMap((tree) => {
                return [tree.rootTile.plusX(-1), tree.rootTile.plusX(1)]
                    .filter((p) => !location.isOccupied(p) && this.npc.isNicelyWalkable(p))
                    .map((walkToPos) => {
                        const interactWith = tree.rootTile
                        return [walkToPos, { interactWith, speedMultiplier: 0.5 }] as [
                            Point,
                            WalkToOptions
                        ]
                    })
            })

        return this.getWorkLocation(options, "hourly")
    }

    private getWorkLocation<T>(options: T[], changeFrequency: "daily" | "hourly" = "daily"): T {
        const salt =
            changeFrequency === "daily"
                ? WorldTime.instance.currentDay
                : WorldTime.instance.currentHour
        // determine work site in a consistent way, add day so they mix it up every day
        return options[hash(this.npc.dude.uuid + salt) % options.length]
    }

    private getJob = () => this.npc.entity.getComponent(Villager).job
}
