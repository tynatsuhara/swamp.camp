import { Component } from "brigsby/dist"
import { session } from "../../online/session"
import { Dude } from "../Dude"
import { DudeType } from "../DudeType"
import { Berto } from "./Berto"

export class Visitor extends Component {
    private dude: Dude

    awake() {
        this.dude = this.entity.getComponent(Dude)
    }

    /**
     * Called after the visitor is spawned
     */
    welcome() {
        if (session.isGuest()) {
            return
        }

        const announcement: string = {
            [DudeType.SPOOKY_VISITOR]:
                "Thy villagers hath reported a spooky interloper lurking outside the camp...",
        }[this.dude.type]

        if (announcement) {
            Berto.instance?.addAnnouncement({
                id: this.getAnnouncementId(),
                metadata: {
                    message: announcement,
                },
            })
        }

        // TODO: Make the visitor leave after a while.
        // Should this use the event queue?
        // The spooky visitor will vanish as soon as they sense an enemy.
        // It should also delete the announcement.
        // Maybe we can create a Visitor component?
    }

    delete() {
        Berto.instance?.removeAnnouncement(this.getAnnouncementId())
        super.delete()
    }

    private getAnnouncementId() {
        return `visitor-${this.dude.uuid}`
    }
}
