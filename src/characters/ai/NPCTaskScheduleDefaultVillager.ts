import { ElementType } from "../../world/elements/Elements"
import { LocationManager } from "../../world/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldLocation } from "../../world/WorldLocation"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { NPCSchedules } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleDefaultVillager extends NPCTask {
    performTask(context: NPCTaskContext): void {
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        let goalLocation: WorldLocation
        if (
            timeOfDay > NPCSchedules.VILLAGER_WAKE_UP_TIME &&
            timeOfDay < NPCSchedules.VILLAGER_GO_HOME_TIME
        ) {
            // Are you feeling zen? If not, a staycation is what I recommend.
            // Or better yet, don't be a jerk. Unwind by being a man... and goin' to work.
            goalLocation = this.findWorkLocation()
            if (!goalLocation) {
                goalLocation = LocationManager.instance.exterior()
            }
        } else {
            // Go home!
            goalLocation = this.findHomeLocation(context.dude)

            // TODO: Go to light
            if (!goalLocation) {
            }
        }

        if (!goalLocation || context.dude.location === goalLocation) {
            context.roam(0.5, {
                pauseEveryMillis: 2500 + 2500 * Math.random(),
                pauseForMillis: 2500 + 5000 * Math.random(),
            })
        } else {
            context.goToLocation(goalLocation)
        }
    }

    private findHomeLocation(dude: Dude) {
        const houses = LocationManager.instance
            .exterior()
            .getElements()
            .flatMap((el) => el.entity.getComponents(Residence))
            .filter((residence) => residence?.isHomeOf(dude.uuid))

        if (houses.length > 0) {
            return LocationManager.instance.get(houses[0].locationUUID)
        }
    }

    private findWorkLocation() {
        const mines = LocationManager.instance
            .exterior()
            .getElementsOfType(ElementType.MINE_ENTRANCE)
            .map((el) => el.save()["destinationUUID"])

        if (mines.length === 0) {
            return null
        }

        return LocationManager.instance.get(mines[0])
    }
}
