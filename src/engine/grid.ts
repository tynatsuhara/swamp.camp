import { Point } from "./point"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    private readonly map: Map<Point, T> = new Map()
    
    set(pt: Point, entry: T) {
        this.map.set(pt, entry)
    }
    
    // returns null if not present in the grid
    get(pt: Point): T {
        return this.map.get(pt)
    }

    entries(): T[] {
        return Array.from(this.map.values())
    }
}