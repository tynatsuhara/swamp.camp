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
        this.npc.dude.updateDialogueIndicator()
    }

    getAnnouncements(): Announcement[] {
        return this.npc.dude.blob[ANNOUNCEMENT_KEY] ?? []
    }

    hasAnnouncements(): boolean {
        return this.getAnnouncements().length > 0
    }

    shiftAnnouncement(): void {
        const announcements = this.getAnnouncements()
        announcements.shift()
        this.npc.dude.blob[ANNOUNCEMENT_KEY] = announcements
        this.npc.dude.updateDialogueIndicator()
    }

    removeAnnouncement(id: string) {
        this.npc.dude.blob[ANNOUNCEMENT_KEY] = this.getAnnouncements().filter((a) => a.id !== id)
        this.npc.dude.updateDialogueIndicator()
    }
}

const ANNOUNCEMENT_KEY = "announcements"
