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

    plusX(dx: number): Point {
        return new Point(this.x + dx, this.y)
    }

    plusY(dy: number): Point {
        return new Point(this.x, this.y + dy)
    }

    minus(other: Point): Point {
        return new Point(this.x - other.x, this.y - other.y)
    }

    lerp(multiplier: number, goal: Point): Point {
        return this.plus(goal.minus(this).times(multiplier))
    }

    distanceTo(pt: Point): number {
        const dx = pt.x - this.x
        const dy = pt.y - this.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    magnitude(): number {
        return this.distanceTo(new Point(0, 0))
    }

    normalized(): Point {
        return this.div(this.magnitude())
    }

    toString(): string {
        return `(${this.x},${this.y})`
    }

    /**
     * Parses a string of the format "(x,y)"
     * Behavior is undefined when the paramter is incorrectly formatted.
     */
    static fromString(s: string) : Point {
        const halves = s.replace("(", "").replace(")", "").split(",").map(n => Number.parseInt(n))
        return new Point(halves[0], halves[1])
    }

    equals(pt: Point) {
        return pt.x == this.x && pt.y == this.y
    }

    apply(fn: (n: number) => number) {
        return new Point(fn(this.x), fn(this.y))
    }
}