export class DialogueInstance {
    readonly id: Dialogue
    readonly lines: string[]
    readonly options: [string, () => void][]

    /**
     * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
     * @param options If any are provided, will be prompted after the last line.
     *                Clicking an option will execute the corresponding function.
     *                If the function returns a Dialogue, that will then be prompted.
     */
    constructor(id: Dialogue, lines: string[], ...options: [string, () => void|Dialogue][]) {
        this.id = id
        this.lines = lines
        this.options = options
    }
}

export const enum Dialogue {
    DIP_0 = "dip_0"
}

export const getDialogue = (d: Dialogue): DialogueInstance => DIALOGUE_MAP[d]()

const DIALOGUE_MAP: { [key: string]: () => DialogueInstance } = {
    [Dialogue.DIP_0]: () => new DialogueInstance(Dialogue.DIP_0, 
        ["Hello! This is my string that should be long enough to wrap to the next line :)", "My name is DIP."],
        ["Nice to meet you!", () => console.log("option A")],
        ["...", () => console.log("option B")],
    )
}
