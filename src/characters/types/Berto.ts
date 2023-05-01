import { Component, Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { tilesAround } from "../../Utils"
import { session } from "../../online/session"
import { TimeUnit } from "../../world/TimeUnit"
import { ElementType } from "../../world/elements/ElementType"
import { camp } from "../../world/locations/LocationManager"
import { DudeType } from "../DudeType"
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
        this.npc.dude.doWhileLiving(() => {
            this.updateSchedule()
            return TimeUnit.HOUR
        })
    }

    private updateSchedule() {
        // This is all temporary and should change once we have a town hall

        const closestCampfireGoal = Point.ZERO // closest to middle of map
        const location = camp()
        const closestCampfire = location
            .getElementsOfType(ElementType.CAMPFIRE)
            .sort(
                (a, b) =>
                    a.pos.distanceTo(closestCampfireGoal) - b.pos.distanceTo(closestCampfireGoal)
            )[0]?.pos

        const tileOptions: Point[] = (
            closestCampfire
                ? tilesAround(closestCampfire, 2)
                : // TODO this will break if he goes inside
                  tilesAround(camp().getDude(DudeType.DIP).tile, 4)
        ).filter((pt) => !location.isOccupied(pt))

        // stay where he is if it's fine, otherwise find a new tile
        const tile =
            tileOptions.find((pt) => pt.equals(this.npc.dude.tile)) ?? Lists.oneOf(tileOptions)

        this.npc.setSchedule(NPCSchedules.newGoToLocationSchedule(location.uuid, tile))
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
