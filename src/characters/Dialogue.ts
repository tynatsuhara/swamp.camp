import { saveManager } from "../SaveManager"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { BERTO_INTRO_DIALOGUE } from "./dialogues/BertoIntro"
import { DIP_INTRO_DIALOGUE } from "./dialogues/DipIntro"
import { GENERIC_DIALOGUE } from "./dialogues/GenericDialogue"
import { ITEM_DIALOGUES } from "./dialogues/ItemDialogues"
import { Player } from "./Player"

export const EMPTY_DIALOGUE = "-"

export class DialogueInstance {
    readonly lines: string[]
    readonly next: () => void|NextDialogue
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
    constructor(lines: string[], next: () => void|NextDialogue, options: DialogueOption[], indicator: string = DudeInteractIndicator.NONE) {
        this.lines = lines
        this.next = next
        this.options = options
        this.indicator = indicator
    }
}

// Shorthand functions for creating dialogue
export const dialogueWithOptions = (lines: string[], indicator: string = DudeInteractIndicator.NONE, ...options: DialogueOption[]): DialogueInstance => { 
    return new DialogueInstance(lines, () => {}, options, indicator) 
}
export const dialogue = (lines: string[], next: () => void|NextDialogue = () => {}, indicator: string = DudeInteractIndicator.NONE): DialogueInstance => { 
    return new DialogueInstance(lines, next, [], indicator) 
} 
export const option = (text: string, nextDialogue: string, open: boolean = true): DialogueOption => {
    return new DialogueOption(text, () => new NextDialogue(nextDialogue, open))
}
export const saveAfterDialogueStage = () => {
    // save after a delay to account for the next dialogue stage being set
    setTimeout(() => saveManager.save(), 500)
}
export const inv = () => Player.instance.dude.inventory

export interface DialogueSource {
    /**
     * the unique dialogue key
     */
    dialogue: string
}

export class DialogueOption {
    readonly text: string
    readonly next: () => void|NextDialogue

    constructor(text: string, next: () => void|NextDialogue) {
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
    const f = DIALOGUE_MAP[dialogue]
    if (!f) {
        throw new Error("cannot find dialogue " + dialogue)
    }
    return f()
}

const DIALOGUE_SOURCES: { [key: string]: () => DialogueInstance }[] = [
    DIP_INTRO_DIALOGUE,
    BERTO_INTRO_DIALOGUE,
    ITEM_DIALOGUES,
    GENERIC_DIALOGUE,
]

/**
 * State should only be modified in the "next" functions. If state is changed 
 * in the top-level Dialogue functions, it can be triggered repeatedly if the 
 * dialogue is opened/closed or if the game is saved then loaded.
 */
const DIALOGUE_MAP: { [key: number]: () => DialogueInstance } = Object.assign({}, ...DIALOGUE_SOURCES)