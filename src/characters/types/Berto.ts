import { Component, Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { Queequeg } from "../../world/elements/Queequeg"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Announcement } from "../dialogue/Announcements"
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
    }

    updateSchedule() {
        if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_DEPARTURE_CHECK)) {
            // head towards the exit
            this.npc.setSchedule(NPCSchedules.newGoToSchedule(Queequeg.instance.entryTile))
        } else if (EventQueue.instance.containsEventType(QueuedEventType.HERALD_RETURN_WITH_NPC)) {
            // off the map, do nothing
            this.npc.setSchedule(NPCSchedules.newNoOpSchedule())
        } else {
            // TODO update this to be more dynamic, right now it will probably break if these are all occupied
            const pts = [new Point(-3, 0), new Point(-3, 1), new Point(-2, 0), new Point(-2, 1)]

            this.npc.setSchedule(
                NPCSchedules.newGoToSchedule(
                    // filter out occupied points to not get stuck in the campfire
                    Lists.oneOf(pts.filter((pt) => !this.npc.dude.location.isOccupied(pt)))
                )
            )
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
