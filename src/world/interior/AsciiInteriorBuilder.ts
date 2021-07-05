import { Point } from "brigsby/dist/Point"

export class AsciiInteriorBuilder {

    private readonly ascii: String[]

    constructor(...ascii: String[]) {
        this.ascii = ascii
    }

    map(char: string, fn: (pos: Point) => void) {
        if (char.length !== 1) {
            throw new Error(`"${char}" should be of length 1`)
        }
        for (let row = 0; row < this.ascii.length; row++) {
            for (let col = 0; col < this.ascii[row].length; col++) {
                if (this.ascii[row][col] == char) {
                    fn(new Point(col, row))
                }
            }
        }
        return this
    }
}