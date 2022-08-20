import { NO_BREAK_SPACE_CHAR } from "./Text"

export class TextTyper {
    private static readonly MS_PER_CHAR = 35

    private text: string
    private onFinish: () => void

    private letterTicker = 0
    private finishedPrinting = false

    get isFinished() {
        return this.finishedPrinting
    }

    constructor(text: string, onFinish: () => void) {
        this.text = text
        this.onFinish = onFinish
    }

    update(skipButtonClick: boolean, elapsedTimeMillis: number) {
        if (this.letterTicker !== 0 && skipButtonClick) {
            if (this.finishedPrinting) {
                this.onFinish()
                this.onFinish = () => {}
            }
            this.finishedPrinting = true
        }
        this.letterTicker += elapsedTimeMillis
    }

    getText(): string {
        if (this.finishedPrinting) {
            return this.text
        }

        const charsToShow = Math.floor(this.letterTicker / TextTyper.MS_PER_CHAR)

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
