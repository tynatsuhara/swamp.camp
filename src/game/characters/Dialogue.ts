import { SaveManager } from "../SaveManager"
import { DudeInteractIndicator } from "../ui/DudeInteractIndicator"
import { DIP_INTRO_DIALOGUE } from "./dialogues/DipIntro"
import { BERTO_INTRO_DIALOGUE } from "./dialogues/BertoIntro"
import { Player } from "./Player"
import { ITEM_DIALOGUES } from "./dialogues/ItemDialogues"

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
export const option = (text: string, next: Dialogue, open: boolean = true): DialogueOption => {
    return new DialogueOption(text, () => new NextDialogue(next, open))
}
export const saveAfterDialogueStage = () => {
    // save after a delay to account for the next dialogue stage being set
    setTimeout(() => SaveManager.instance.save(), 500)
}
export const inv = () => Player.instance.dude.inventory

export interface DialogueSource {
    dialogue: Dialogue
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
    readonly dialogue: Dialogue
    readonly open: boolean

    constructor(dialogue: Dialogue, open: boolean = true) {
        if (!dialogue) {
            throw new Error("dialogue can't be null")
        }
        this.dialogue = dialogue
        this.open = open
    }
}

export const enum Dialogue {
    NONE = 0,
    DIP_0, DIP_1, DIP_2, DIP_3, DIP_BEFRIEND, DIP_MAKE_CAMPFIRE,
    BERT_0,
    CAMPFIRE
}

export const getDialogue = (d: Dialogue): DialogueInstance => {
    const f = DIALOGUE_MAP[d]
    if (!f) {
        throw new Error("cannot find dialogue " + d)
    }
    return f()
}

const DIALOGUE_SOURCES: { [key: number]: () => DialogueInstance }[] = [
    DIP_INTRO_DIALOGUE,
    BERTO_INTRO_DIALOGUE,
    ITEM_DIALOGUES,
]

/**
 * State should only be modified in the "next" functions. If state is changed 
 * in the top-level Dialogue functions, it can be triggered repeatedly if the 
 * dialogue is opened/closed or if the game is saved then loaded.
 */
const DIALOGUE_MAP: { [key: number]: () => DialogueInstance } = Object.assign({}, ...DIALOGUE_SOURCES)