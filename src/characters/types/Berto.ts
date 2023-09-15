import { Component } from "brigsby/dist"
import { session } from "../../online/session"
import { NPC } from "../NPC"
import { NPCSchedules } from "../ai/NPCSchedule"
import { Announcement } from "../dialogue/Announcements"

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
        if (session.isGuest()) {
            return
        }

        // wait until start() since schedule relies on the EventQueue and locations being initialized
        this.npc.setSchedule(NPCSchedules.newDefaultVillagerSchedule())
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
