import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { pixelPtToTilePt } from "../../graphics/Tilesets"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { LocationManager } from "../../world/LocationManager"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Dude } from "../Dude"
import { NPC } from "../NPC"

export class Berto extends Component {
    start() {
        // wait until start() since schedule relies on the EventQueue and locations being initialized
        this.updateSchedule()
    }

    updateSchedule() {
        const npc = this.entity.getComponent(NPC)
        const dude = this.entity.getComponent(Dude)

        if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_DEPARTURE_CHECK)) {
            // head towards the exit
            const destination = pixelPtToTilePt(LocationManager.instance.exteriorEntrancePosition())
            npc.setSchedule(NPCSchedules.newGoToSchedule(destination))
        } else if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_RETURN_WITH_NPC)) {
            // off the map, do nothing
            npc.setSchedule(NPCSchedules.newNoOpSchedule())
        } else {
            // TODO update this to be more dynamic, right now it will probably break if these are all occupied
            const pts = [new Point(-3, 0), new Point(-3, 1), new Point(-2, 0), new Point(-2, 1)]

            npc.setSchedule(
                NPCSchedules.newGoToSchedule(
                    // filter out occupied points to not get stuck in the campfire
                    Lists.oneOf(pts.filter((pt) => !dude.location.isOccupied(pt)))
                )
            )
        }
    }
}
