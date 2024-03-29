import { InteractIndicator } from "../../ui/InteractIndicator"
import { BED_DIALOGUES } from "./BedDialogue"
import { BERTO_INTRO_DIALOGUE } from "./BertoDialogue"
import { CAMPFIRE_DIALOGUES } from "./CampfireDialogue"
import { DIP_INTRO_DIALOGUE } from "./DipDialogue"
import { DOCTOR_DIALOGUE } from "./DoctorDialogue"
import { DONATION_DIALOGUES } from "./DonationBoxDialogue"
import { GENERIC_DIALOGUE } from "./GenericDialogue"
import { LANTERN_DIALOGUES } from "./LanternDialogue"
import { ONION_DIALOGUE } from "./OnionDialogue"
import { SPOOKY_VISITOR_DIALOGUE } from "./SpookyVisitorDialogue"
import { VILLAGER_DIALOGUE } from "./VillagerDialogue"

export const EMPTY_DIALOGUE = "-"

export class DialogueInstance {
    private _lines: string[] | (() => string[]) | undefined
    get lines() {
        if (typeof this._lines === "function") {
            this._lines = this._lines()
        }
        return this._lines
    }
    readonly next: () => NextDialogue
    readonly options: DialogueOption[]
    readonly indicator: InteractIndicator

    /**
     * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
     * @param next Callback called once these lines finish. If present, options will be ignored.
     *             If the function returns a NextDialogue object, it will be presented next.
     * @param options If any are provided, and next != null, will be prompted after the last line.
     *                Clicking an option will execute the corresponding function.
     *                If the function returns a Dialogue, that will then be prompted.
     */
    constructor(
        lines: string[] | (() => string[]) | undefined,
        next: () => NextDialogue,
        options: DialogueOption[],
        indicator: InteractIndicator = InteractIndicator.NONE
    ) {
        this._lines = lines
        this.next = next
        this.options = options.filter((o) => !!o)
        this.indicator = indicator
    }
}

// When processed by DialogueDisplay, immediately loads the next dialogue
// Useful for when you want to show a next dialogue without any interstitial text or options
export const redirectDialogue = (next: () => NextDialogue) => {
    return new DialogueInstance(undefined, next, [])
}

// Shorthand functions for creating dialogue
export const dialogueWithOptions = (
    lines: string[] | (() => string[]),
    indicator: InteractIndicator = InteractIndicator.NONE,
    ...options: DialogueOption[]
): DialogueInstance => {
    return new DialogueInstance(lines, () => null, options, indicator)
}
export const dialogue = (
    lines: string[],
    next: () => NextDialogue = () => null,
    indicator: InteractIndicator = InteractIndicator.NONE
): DialogueInstance => {
    return new DialogueInstance(lines, next, [], indicator)
}
export const option = (
    text: string,
    nextDialogue: string,
    open: boolean = true
): DialogueOption => {
    return new DialogueOption(text, () => new NextDialogue(nextDialogue, open))
}

export const getExitText = () => "Never mind."

export interface DialogueSource {
    /**
     * the unique dialogue key
     */
    dialogue: string
}

export class DialogueOption {
    constructor(readonly text: string, readonly next: () => NextDialogue) {}
}

export class NextDialogue {
    /**
     * @param dialogue the unique dialogue key
     * @param open true if the dialogue should be shown immediately
     */
    constructor(readonly dialogue: string, readonly open: boolean) {
        if (!dialogue) {
            throw new Error("dialogue can't be null")
        }
    }
}

export type DialogueSet = {
    [key: string]: (source: DialogueSource) => DialogueInstance | undefined
}

/**
 * @param dialogue the unique dialogue key
 */
export const getDialogue = (
    dialogue: string,
    source: DialogueSource
): DialogueInstance | undefined => {
    if (dialogue === EMPTY_DIALOGUE) {
        return
    }

    // making this a static constant caused issues
    const set: DialogueSet = {
        ...DIP_INTRO_DIALOGUE,
        ...BERTO_INTRO_DIALOGUE,
        ...GENERIC_DIALOGUE,
        ...DOCTOR_DIALOGUE,
        ...BED_DIALOGUES,
        ...CAMPFIRE_DIALOGUES,
        ...VILLAGER_DIALOGUE,
        ...SPOOKY_VISITOR_DIALOGUE,
        ...DONATION_DIALOGUES,
        ...LANTERN_DIALOGUES,
        ...ONION_DIALOGUE,
    }

    const dialogueSupplier = set[dialogue]
    if (!dialogueSupplier) {
        throw new Error("cannot find dialogue " + dialogue)
    }
    return dialogueSupplier(source)
}
