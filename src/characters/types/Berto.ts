import { Component, Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { tilesAround } from "../../Utils"
import { ElementType } from "../../world/elements/Elements"
import { Queequeg } from "../../world/elements/Queequeg"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { camp } from "../../world/locations/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Announcement } from "../dialogue/Announcements"
import { DudeType } from "../DudeType"
import { NPC } from "../NPC"

export class Berto extends Component {
    static instance: Berto
    private npc: NPC

    constructor() {
        super()
        Berto.instance = this
    }

    awake() {
        this.npc = this.entity.getComponent(NPC)
    }

    start() {
        // wait until start() since schedule relies on the EventQueue and locations being initialized
        this.updateSchedule()
        this.npc.dude.doWhileLiving(() => this.updateSchedule(), TimeUnit.HOUR)
    }

    updateSchedule() {
        if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_DEPARTURE_CHECK)) {
            // head towards the exit
            this.npc.setSchedule(NPCSchedules.newGoToSchedule(Queequeg.instance.entryTile))
        } else if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_RETURN_WITH_NPC)) {
            // off the map, do nothing
            this.npc.setSchedule(NPCSchedules.newNoOpSchedule())
        } else {
            const closestCampfireGoal = Point.ZERO // closest to middle of map
            const location = camp()
            const closestCampfire = location
                .getElementsOfType(ElementType.CAMPFIRE)
                .sort(
                    (a, b) =>
                        a.pos.distanceTo(closestCampfireGoal) -
                        b.pos.distanceTo(closestCampfireGoal)
                )[0]?.pos

            const tileOptions: Point[] = closestCampfire
                ? tilesAround(closestCampfire, 2)
                : // TODO this will break if he goes inside
                  tilesAround(camp().getDude(DudeType.DIP).tile, 4)

            const tile = Lists.oneOf(tileOptions.filter((pt) => !location.isOccupied(pt)))
            this.npc.setSchedule(NPCSchedules.newGoToLocationSchedule(location.uuid, tile))
        }
    }

    addAnnouncement(a: Announcement) {
        const announcements = this.getAnnouncements()
        announcements.push(a)
        this.npc.dude.blob[ANNOUNCEMENT_KEY] = announcements
    }

    getAnnouncements(): Announcement[] {
        return this.npc.dude.blob[ANNOUNCEMENT_KEY] ?? []
    }

    shiftAnnouncement(): Announcement {
        const announcements = this.getAnnouncements()
        const result = announcements.shift()
        this.npc.dude.blob[ANNOUNCEMENT_KEY] = announcements
        return result
    }

    removeAnnouncement(id: string) {
        this.npc.dude.blob[ANNOUNCEMENT_KEY] = this.getAnnouncements().filter((a) => a.id !== id)
    }
}

const ANNOUNCEMENT_KEY = "announcements"
