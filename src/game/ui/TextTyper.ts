import { UpdateData } from "../../engine/Engine"

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

        return this.text.substring(0, charsToShow) + (" ".repeat(this.text.length - charsToShow))
    }
}