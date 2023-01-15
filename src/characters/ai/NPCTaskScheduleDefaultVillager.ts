import { Lists } from "brigsby/dist/util"
import { DarknessMask } from "../../world/DarknessMask"
import { Campfire } from "../../world/elements/Campfire"
import { ElementType } from "../../world/elements/Elements"
import { LightManager } from "../../world/LightManager"
import { Location } from "../../world/locations/Location"
import { camp, LocationManager } from "../../world/locations/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { VillagerJob } from "../dialogue/VillagerDialogue"
import { Dude } from "../Dude"
import { DudeFaction } from "../DudeFactory"
import { DudeType } from "../DudeType"
import { WeaponType } from "../weapons/WeaponType"
import { NPCSchedules } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleDefaultVillager extends NPCTask {
    performTask(context: NPCTaskContext): void {
        const { dude } = context
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        let goalLocation: Location
        if (
            timeOfDay > NPCSchedules.VILLAGER_WAKE_UP_TIME &&
            timeOfDay < NPCSchedules.VILLAGER_GO_HOME_TIME
        ) {
            // Are you feeling zen? If not, a staycation is what I recommend.
            // Or better yet, don't be a jerk. Unwind by being a man... and goin' to work.
            goalLocation = this.findWorkLocation(dude) ?? camp()
        } else {
            // Go home!
            goalLocation = this.findHomeLocation(dude)
            dude.setWeapon(WeaponType.NONE, -1)
        }

        if (goalLocation && dude.location !== goalLocation) {
            context.goToLocation(goalLocation)
            return
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
        context.roam(0.5, {
            pauseEveryMillis: 2500 + 2500 * Math.random(),
            pauseForMillis: 2500 + 5000 * Math.random(),
        })
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

        const job = dude.blob["job"] as VillagerJob

        if (job === VillagerJob.MINE) {
            const mines = camp()
                .getElementsOfType(ElementType.MINE_ENTRANCE)
                .map((el) => el.save().destinationUUID)

            if (mines.length === 0) {
                return
            }

            // side effect
            dude.setWeapon(WeaponType.PICKAXE, -1)

            return LocationManager.instance.get(mines[0])
        } else if (job === VillagerJob.HARVEST_WOOD) {
            // side effect
            dude.setWeapon(WeaponType.AXE, -1)

            return camp()
        } else if (job === VillagerJob.DEFEND) {
            // side effect
            dude.setWeapon(WeaponType.CLUB, -1)

            return camp()
        }
    }

    private goToClosestFire(context: NPCTaskContext) {
        if (
            LightManager.instance.isFullyLit(context.dude.standingPosition, context.dude.location)
        ) {
            context.doNothing()
            return
        }

        const burningFires = context.dude.location
            .getElementsOfType(ElementType.CAMPFIRE)
            .filter((c) => c.entity.getComponent(Campfire).isBurning)

        if (burningFires.length === 0) {
            context.doNothing()
            return
        }

        const closestFire = Lists.minBy(burningFires, (e) =>
            e.pos.distanceTo(context.dude.standingPosition)
        )

        // this works fine enough ¯\_(ツ)_/¯
        context.walkTo(closestFire.pos.plusY(1))
    }
}
