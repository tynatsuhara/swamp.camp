import { Lists } from "brigsby/dist/util/Lists"
import { DarknessMask } from "../../world/DarknessMask"
import { Campfire } from "../../world/elements/Campfire"
import { ElementType } from "../../world/elements/Elements"
import { LightManager } from "../../world/LightManager"
import { Location } from "../../world/Location"
import { camp, LocationManager } from "../../world/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
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
            goalLocation = this.findWorkLocation()
            if (!goalLocation) {
                goalLocation = camp()
            }
        } else {
            // Go home!
            goalLocation = this.findHomeLocation(dude)
        }

        if (!goalLocation || dude.location === goalLocation) {
            // TODO: Go to light
            if (timeOfDay < DarknessMask.SUNRISE_START || timeOfDay > DarknessMask.SUNSET_END) {
                if (LightManager.instance.isFullyLit(dude.standingPosition, dude.location)) {
                    context.doNothing()
                    return
                }

                const burningFires = dude.location
                    .getElementsOfType(ElementType.CAMPFIRE)
                    .filter((c) => c.entity.getComponent(Campfire).logs > 0)

                if (burningFires.length === 0) {
                    context.doNothing()
                    return
                }

                const closestFire = Lists.minBy(burningFires, (e) =>
                    e.pos.distanceTo(dude.standingPosition)
                )

                // this works fine enough ¯\_(ツ)_/¯
                context.walkTo(closestFire.pos.plusY(1))
                return
            }

            context.roam(0.5, {
                pauseEveryMillis: 2500 + 2500 * Math.random(),
                pauseForMillis: 2500 + 5000 * Math.random(),
            })
        } else {
            context.goToLocation(goalLocation)
        }
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

    private findWorkLocation() {
        const mines = camp()
            .getElementsOfType(ElementType.MINE_ENTRANCE)
            .map((el) => el.save()["destinationUUID"])

        if (mines.length === 0) {
            return null
        }

        return LocationManager.instance.get(mines[0])
    }
}
