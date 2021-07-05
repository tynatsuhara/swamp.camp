import { UpdateData } from "brigsby/dist/Engine"
import { NO_BREAK_SPACE_CHAR } from "./Text"

export class TextTyper {

    private static readonly MS_PER_CHAR = 35

    private text: string
    private onFinish: () => void

    private letterTicker = 0
    private finishedPrinting = false

    get isFinished() { return this.finishedPrinting }

    constructor(text: string, onFinish: () => void) {
        this.text = text
        this.onFinish = onFinish
    }

    update(shouldProceed: boolean, elapsedTimeMillis: number): string {
        if (this.letterTicker !== 0 && shouldProceed) {
            if (this.finishedPrinting) {
                this.onFinish()
                this.onFinish = () => {}
            }
            this.finishedPrinting = true
        }

        if (this.finishedPrinting) {
            return this.text
        }

        this.letterTicker += elapsedTimeMillis
        const charsToShow = Math.floor(this.letterTicker/TextTyper.MS_PER_CHAR)

        if (charsToShow === this.text.length) {
            this.finishedPrinting = true
            return this.text
        }

        let str = this.text.substring(0, charsToShow)
        for (let i = charsToShow; i < this.text.length; i++) {
            if (this.text[i] === " ") {
                str += " "
            } else if (this.text[i] === "\n") {
                str += "\n"
            } else {
                str += NO_BREAK_SPACE_CHAR
            }
        }

        return str
    }
}