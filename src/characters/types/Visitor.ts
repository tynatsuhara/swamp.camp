import { Component } from "brigsby/dist/Component"
import { Dude } from "../Dude"
import { DudeType } from "../DudeFactory"
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
        const announcement: string = {
            // TODO herald-ify the language
            [DudeType.SPOOKY_VISITOR]: "I spotted a spooky person lurking outside the camp...",
        }[this.dude.type]

        if (announcement) {
            Berto.instance.addAnnouncement({
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
        Berto.instance.removeAnnouncement(this.getAnnouncementId())
        super.delete()
    }

    getAnnouncementId() {
        return `visitor-${this.dude.uuid}`
    }
}
