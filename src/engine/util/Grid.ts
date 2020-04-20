import { Point } from "../point"
import { BinaryHeap } from "./BinaryHeap"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    private readonly map: Map<string, T> = new Map()
    
    set(pt: Point, entry: T) {
        this.map.set(pt.toString(), entry)
    }
    
    // returns null if not present in the grid
    get(pt: Point): T {
        return this.map.get(pt.toString())
    }

    entries(): T[] {
        return Array.from(this.map.values())
    }

    findPath(
        start: Point, 
        end: Point, 
        isOccupied: (pt: Point) => boolean = (pt: Point) => !!this.get(pt),
        heuristic: (pt: Point) => number = (pt: Point) => pt.distanceTo(end)
    ): Point[] {
        const gScore = new Map<string, number>()
        gScore.set(start.toString(), 0)

        const fScore = new Map<string, number>()
        fScore.set(start.toString(), 0)

        const cameFrom = new Map<string, Point>()
        const openSet = new BinaryHeap<Point>(p => fScore.get(p.toString()))
        openSet.push(start)

        while (openSet.size() > 0) {
            const current = openSet.pop()

            if (current.equals(end)) {
                const path = []
                let next = current
                while (next) {
                    path.push(next)
                    next = cameFrom.get(current.toString())
                }
                return path.reverse()
            }

            const currentGScore = gScore.get(current.toString())
            const x = current.x
            const y = current.y
            
            const neighbors = [
                new Point(x, y - 1), new Point(x - 1, y), new Point(x + 1, y), new Point(x, y + 1)
            ].filter(pt => !isOccupied(pt))
            
            for (let neighbor of neighbors) {
                const n = neighbor.toString()
                const tentativeGScore = currentGScore + current.distanceTo(neighbor)
                const currentNeighborGScore = gScore.get(n)
                if (!currentGScore || tentativeGScore < currentNeighborGScore) {
                    cameFrom.set(n, current)
                    gScore.set(n, tentativeGScore)
                    fScore.set(n, tentativeGScore + heuristic(neighbor))
                    openSet.push(neighbor)
                }
            }
        }

        return null
    }
}