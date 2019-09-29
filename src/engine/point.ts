export class Point {
    // relative to top left corner
    readonly x: number
    readonly y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    times(multiplier: number): Point {
        return new Point(this.x * multiplier, this.y * multiplier)
    }

    plus(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y)
    }
}