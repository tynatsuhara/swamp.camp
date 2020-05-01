import { Point } from "../point"
import { BinaryHeap } from "./BinaryHeap"

// an infinite grid using x/y coordinates (x increases to the right, y increases down)
export class Grid<T> {
    private map: { [key: string]: T } = {}
    
    set(pt: Point, entry: T) {
        this.map[pt.toString()] = entry
    }
    
    // returns null if not present in the grid
    get(pt: Point): T {
        return this.map[pt.toString()]
    }

    remove(pt: Point) {
        delete this.map[pt.toString()]
    }

    entries(): [Point, T][] {
        return Object.entries(this.map).map(tuple => [Point.fromString(tuple[0]), tuple[1]])
    }

    values(): T[] {
        return Object.values(this.map)
    }

    findPath(
        start: Point, 
        end: Point, 
        heuristic: (pt: Point) => number = pt => pt.distanceTo(end),
        isOccupied: (pt: Point) => boolean = pt => !!this.get(pt),
        getNeighbors: (pt: Point) => Point[] = pt => [new Point(pt.x, pt.y - 1), new Point(pt.x - 1, pt.y), new Point(pt.x + 1, pt.y), new Point(pt.x, pt.y + 1)]
    ): Point[] {
        if (isOccupied(start) || isOccupied(end)) {
            return null
        }

        const gScore = new Map<string, number>()
        gScore.set(start.toString(), 0)

        const fScore = new Map<string, number>()
        fScore.set(start.toString(), 0)

        const cameFrom = new Map<string, Point>()
        const openSetUnique = new Set<string>()
        const openSet = new BinaryHeap<Point>(p => fScore.get(p.toString()))
        openSet.push(start)

        while (openSet.size() > 0) {
            const current = openSet.pop()
            openSetUnique.delete(current.toString())

            if (current.equals(end)) {
                const path = []
                let next = current
                while (next) {
                    path.push(next)
                    next = cameFrom.get(next.toString())
                }
                return path.reverse()
            }

            const currentGScore = gScore.get(current.toString())
            
            const neighbors = getNeighbors(current).filter(pt => !isOccupied(pt) && !pt.equals(start))
            
            for (let neighbor of neighbors) {
                const n = neighbor.toString()
                const tentativeGScore = currentGScore + current.distanceTo(neighbor)
                const currentNeighborGScore = gScore.get(n)
                if (!currentNeighborGScore || tentativeGScore < currentNeighborGScore) {
                    cameFrom.set(n, current)
                    gScore.set(n, tentativeGScore)
                    fScore.set(n, tentativeGScore + heuristic(neighbor))
                    if (!openSetUnique.has(n)) {
                        openSet.push(neighbor)
                        openSetUnique.add(n)
                    }
                }
            }
        }

        return null
    }

    save(): { [key: string]: T } {
        return this.map
    }

    static load<T>(map: { [key: string]: T }): Grid<T> {
        const g = new Grid<T>()
        g.map = map
        return g
    }
}