import { dialogue, DialogueInstance, NextDialogue } from "./Dialogue"

export type Announcement = {
    id: string
    // TODO: Maybe un-generalize this. We might just need a string[]
    metadata?: any
}

export const getAnnouncementDialogue = (
    { id, metadata = {} }: Announcement,
    completeAnnouncement: () => NextDialogue
): DialogueInstance => {
    if (id === "explain-town-hall") {
        return dialogue(
            [
                "Huzzah! The construction of a camp's inaugural governmental office is an ennobling milestone for any budding territory.",
                "Since thou have so graciously gifted me a civilized place to conduct my work, I owe thee an explanation of all mine available services.",
                // selling resources
                "My foremost responsibility is to act as a broker with the kingdom. Bring me resources, and I shall handle the logistics of shipping them off for profit!",
                // zoning
                "Another essential function of this office is to file zoning documents with the kingdom.",
                "Should thou desire to construct a new dwelling, storefront, or other structure, visit me here. For but a modest processing fee, it shall be done!",
                // food management
                "An additional fixture of the town hall is the communal provisions chest.",
                "I shall handle the rationing and distribution of any donated foodstuffs amongst thy workers each morning.",
                "While fresh eatables are infinitely superior, I can also assist thee with purchasing non-perishable provisions from the kingdom.",
                // taxes
                "Lastly, I can assist thee with establishing taxes on the villagers, even the penniless convicts! I shall collect taxes at the start of each week.",
                // TODO should we encourage setting up a mine?
                // "Speaking of thy convicts... Now that construction hath concluded, I suggest assigning them to work in the mines. ",
            ],
            completeAnnouncement
        )
    }

    if (id.startsWith("visitor-")) {
        return dialogue([metadata.message], completeAnnouncement)
    }

    return dialogue(["Fuck you!"], completeAnnouncement)
}
