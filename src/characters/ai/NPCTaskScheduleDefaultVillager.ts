import { ElementType } from "../../world/elements/Elements"
import { House } from "../../world/elements/House"
import { LocationManager } from "../../world/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldLocation } from "../../world/WorldLocation"
import { WorldTime } from "../../world/WorldTime"
import { Dude } from "../Dude"
import { NPCSchedule, NPCSchedules } from "./NPCSchedule"
import { NPCTask } from "./NPCTask"
import { NPCTaskContext } from "./NPCTaskContext"

export class NPCTaskScheduleDefaultVillager extends NPCTask {

    constructor(schedule: NPCSchedule) {
        super()
    }

    performTask(context: NPCTaskContext): void {
        const timeOfDay = WorldTime.instance.time % TimeUnit.DAY

        let goalLocation: WorldLocation
        if (timeOfDay > NPCSchedules.VILLAGER_WAKE_UP_TIME 
            && timeOfDay < NPCSchedules.VILLAGER_GO_HOME_TIME) {
            // Are you feeling zen? If not, a staycation is what I recommend. 
            // Or better yet, don't be a jerk. Unwind by being a man... and goin' to work.
            goalLocation = LocationManager.instance.exterior()
        } else {
            // Go home!
            const home = this.findHomeLocation(context.dude)
            if (!home) {
                // homeless behavior
                context.roam(0.5)
                return
            }
            goalLocation = home
        }

        if (context.dude.location === goalLocation) {
            context.roam(0.5, { 
                pauseEveryMillis: 2500 + 2500 * Math.random(),
                pauseForMillis: 2500 + 5000 * Math.random(),
            })
        } else {
            context.goToLocation(goalLocation)
        }
    }

    private findHomeLocation(dude: Dude) {
        const houses = LocationManager.instance.exterior().getElementsOfType(ElementType.HOUSE)
                .map(el => el.entity.getComponent(House))
                .filter(house => house.getResident() === dude.uuid)

        if (houses.length > 0) {
            return LocationManager.instance.get(houses[0].locationUUID)
        }
    }
}