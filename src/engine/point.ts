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

    div(denominator: number): Point {
        return new Point(this.x / denominator, this.y / denominator)
    }

    floorDiv(denominator: number): Point {
        return new Point(
            Math.floor(this.x / denominator), 
            Math.floor(this.y / denominator)
        )
    }

    plus(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y)
    }

    minus(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y)
    }

    lerp(multiplier: number, goal: Point): Point {
        return new Point(this.x + (goal.x - this.x) * multiplier, this.y + (goal.y - this.y) * multiplier)
    }

    distanceTo(pt: Point): number {
        const dx = pt.x - this.x
        const dy = pt.y - this.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    magnitude(): number {
        return this.distanceTo(new Point(0, 0))
    }

    toString(): string {
        return `(${this.x},${this.y})`
    }

    equals(pt: Point) {
        return pt.x == this.x && pt.y == this.y
    }
}