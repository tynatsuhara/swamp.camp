import { saveManager } from "../../SaveManager"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Player } from "../Player"
import { BERTO_INTRO_DIALOGUE } from "./BertoDialogue"
import { DIP_INTRO_DIALOGUE } from "./DipDialogue"
import { DOCTOR_DIALOGUE } from "./DoctorDialogue"
import { GENERIC_DIALOGUE } from "./GenericDialogue"
import { ITEM_DIALOGUES } from "./ItemDialogues"
import { VILLAGER_DIALOGUE } from "./VillagerDialogue"

export const EMPTY_DIALOGUE = "-"

export class DialogueInstance {
    readonly lines: string[]
    readonly next: () => void | NextDialogue
    readonly options: DialogueOption[]
    readonly indicator: string

    /**
     * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
     * @param next Callback called once these lines finish. If present, options will be ignored.
     *             If the function returns a NextDialogue object, it will be presented next.
     * @param options If any are provided, and next != null, will be prompted after the last line.
     *                Clicking an option will execute the corresponding function.
     *                If the function returns a Dialogue, that will then be prompted.
     */
    constructor(
        lines: string[],
        next: () => void | NextDialogue,
        options: DialogueOption[],
        indicator: string = DudeInteractIndicator.NONE
    ) {
        this.lines = lines
        this.next = next
        this.options = options.filter((o) => !!o)
        this.indicator = indicator
    }
}

// Shorthand functions for creating dialogue
export const dialogueWithOptions = (
    lines: string[],
    indicator: string = DudeInteractIndicator.NONE,
    ...options: DialogueOption[]
): DialogueInstance => {
    return new DialogueInstance(lines, () => {}, options, indicator)
}
export const dialogue = (
    lines: string[],
    next: () => void | NextDialogue = () => {},
    indicator: string = DudeInteractIndicator.NONE
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
export const saveAfterDialogueStage = () => {
    // save after a delay to account for the next dialogue stage being set
    setTimeout(() => saveManager.save(), 500)
}
export const inv = () => Player.instance.dude.inventory

export const getExitText = () => "Never mind."

export interface DialogueSource {
    /**
     * the unique dialogue key
     */
    dialogue: string
}

export class DialogueOption {
    readonly text: string
    readonly next: () => void | NextDialogue

    constructor(text: string, next: () => void | NextDialogue) {
        this.text = text
        this.next = next
    }
}

export class NextDialogue {
    readonly dialogue: string
    readonly open: boolean

    /**
     * @param dialogue the unique dialogue key
     * @param open true if the dialogue should be shown immediately
     */
    constructor(dialogue: string, open: boolean = true) {
        if (!dialogue) {
            throw new Error("dialogue can't be null")
        }
        this.dialogue = dialogue
        this.open = open
    }
}

/**
 * @param dialogue the unique dialogue key
 */
export const getDialogue = (dialogue: string): DialogueInstance => {
    if (dialogue === EMPTY_DIALOGUE) {
        return
    }

    // making this a static constant caused issues
    const dialogueMap = {
        ...DIP_INTRO_DIALOGUE,
        ...BERTO_INTRO_DIALOGUE,
        ...GENERIC_DIALOGUE,
        ...DOCTOR_DIALOGUE,
        ...ITEM_DIALOGUES,
        ...VILLAGER_DIALOGUE,
    }

    const f = dialogueMap[dialogue]
    if (!f) {
        throw new Error("cannot find dialogue " + dialogue)
    }
    return f()
}
