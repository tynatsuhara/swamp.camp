export class Dialogue {
    lines: string[]
    options: [string, () => void][]

    /**
     * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
     * @param options If any are provided, will be prompted after the last line.
     *                Clicking an option will execute the corresponding function.
     *                If the function returns a Dialogue, that will then be prompted.
     */
    constructor(lines: string[], options: [string, () => void|Dialogue][] = []) {
        this.lines = lines
        this.options = options
    }
}


export const testDialogue1 = new Dialogue([
    "Hello!", 
    "My name is DIP."
], [
    ["Nice to meet you!", () => console.log("option A")],
    ["...", () => console.log("option B")],
])