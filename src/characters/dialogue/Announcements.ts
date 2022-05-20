import { dialogue, DialogueInstance, NextDialogue } from "./Dialogue"

export type Announcement = {
    id: string
    metadata?: any
}

export const getAnnouncementDialogue = (
    a: Announcement,
    completeAnnouncement: () => NextDialogue
): DialogueInstance => {
    const metadata = a.metadata ?? {}

    if (a.id.startsWith("visitor-")) {
        return dialogue([metadata.message], completeAnnouncement)
    }

    return dialogue(["Fuck you!"], completeAnnouncement)
}
