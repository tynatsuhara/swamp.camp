import { dialogue, DialogueInstance, NextDialogue } from "./Dialogue"

export type Announcement = {
    dialogueKey: string
    metadata?: object
}

export const getAnnouncementDialogue = (
    a: Announcement,
    completeAnnouncement: NextDialogue
): DialogueInstance => {
    return dialogue(["Fuck you!"], () => completeAnnouncement)
}
