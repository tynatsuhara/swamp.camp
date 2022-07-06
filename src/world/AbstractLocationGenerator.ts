import { Point } from "brigsby/dist"
import { Grid, Lists, Noise } from "brigsby/dist/util"
import { ElementType } from "./elements/Elements"
import { GroundType } from "./ground/Ground"
import { Location } from "./Location"
import { LocationManager } from "./LocationManager"

// Represents the granularity of levels/coast variation.
// Should be divisible by 2 and a divisor of MAP_SIZE.
const SQ = 2
const MIN_WATER_SIZE = 50
const MAX_WATER_SIZE = 500

// TODO generalize to other foliage
export type TreeTypeSupplier = () => ElementType.TREE_POINTY | ElementType.TREE_ROUND

/**
 * Base class with utility functions for generating exterior locations.
 * Exterior locations follow these conventions:
 *   - They are always square
 *   - The center of the location is (0, 0)
 */
export abstract class AbstractLocationGenerator {
    generate() {
        console.groupCollapsed("map generation")

        const location = this._generate()

        LocationManager.instance.add(location)

        console.groupEnd()

        return location
    }

    protected abstract _generate(): Location

    /////////////
    // Ground! //
    /////////////

    protected levels(mapRange: number) {
        // We want more bottom ledges than top because it looks nicer with the camera "angle"
        const topBottomThreshold = 0.3
        const sideBottomThreshold = 1

        let levelGrid: Grid<number>
        let levelString: string
        let topBottomRatio: number
        let sideBottomRatio: number

        do {
            console.log("generating levels")
            ;[levelGrid, levelString, topBottomRatio, sideBottomRatio] = this.levelNoise(mapRange)
        } while (topBottomRatio > topBottomThreshold || sideBottomRatio > sideBottomThreshold)

        console.log(levelString)

        return levelGrid
    }

    /**
     * @param levels the number of levels
     * @returns [
     *      a grid of numbers the size of the map,
     *      a printable string visualizing the levels,
     *      the ratio of top/bottom ledges,
     *      the ratio of side/bottom ledges
     * ]
     */
    private levelNoise(
        mapRange: number,
        levels: number = 3,
        seed = Math.random()
    ): [Grid<number>, string, number, number] {
        const noise = new Noise(seed)

        const grid = new Grid<number>()
        let str = `seed: ${seed} \n`

        // Should be divisible by 2 and a divisor of MAP_SIZE
        const noiseScale = 2.5

        // Each entry will occupy a sq x sq tile section to prevent
        // 1-wide entries that are hard to make work art-wise
        // TODO: Smooth out edges to prevent stair-step pattern?

        let bottomLedges = 0
        let topLedges = 0
        let sideLedges = 0

        for (let i = -mapRange - 1; i < mapRange + 1; i += SQ) {
            for (let j = -mapRange - 1; j < mapRange + 1; j += SQ) {
                var value = noise.simplex2(i / (mapRange * noiseScale), j / (mapRange * noiseScale))
                value = (value + 1) / 2 // scale to 0-1
                const level = Math.floor(levels * value)
                str += level

                for (let m = 0; m < SQ; m++) {
                    for (let n = 0; n < SQ; n++) {
                        grid.set(new Point(j + m, i + n), level)
                    }
                }
            }
            str += "\n"
        }

        for (let i = -mapRange - 1; i < mapRange + 1; i += SQ) {
            for (let j = -mapRange - 1; j < mapRange + 1; j += SQ) {
                const level = grid.get(new Point(j, i))

                // Compare top/bottom ratio
                const above = grid.get(new Point(j, i - SQ))
                if (above != null) {
                    if (above < level) {
                        topLedges++
                    } else if (above > level) {
                        bottomLedges++
                    }
                }

                const left = grid.get(new Point(j - SQ, i))
                const right = grid.get(new Point(j + SQ, i))
                if ((left != null && left !== level) || (right != null && right !== level)) {
                    sideLedges++
                }
            }
        }

        str += `top ledges = ${topLedges}\n`
        str += `bottom ledges = ${bottomLedges}\n`
        str += `ratio top/bottom = ${topLedges / bottomLedges}\n`
        str += `side ledges = ${sideLedges}\n`
        str += `ratio side/bottom = ${sideLedges / bottomLedges}\n`

        return [grid, str, topLedges / bottomLedges, sideLedges / bottomLedges]
    }

    protected placeGround(location: Location) {
        for (let i = -location.range - 1; i < location.range + 1; i++) {
            for (let j = -location.range - 1; j < location.range + 1; j++) {
                const pt = new Point(i, j)
                const thisLevel = location.levels?.get(pt)
                const adjacent = [
                    pt.plus(new Point(0, -1)),
                    pt.plus(new Point(1, -1)),
                    pt.plus(new Point(1, 0)),
                    pt.plus(new Point(1, 1)),
                    pt.plus(new Point(0, 1)),
                    pt.plus(new Point(-1, 1)),
                    pt.plus(new Point(-1, 0)),
                    pt.plus(new Point(-1, -1)),
                ]
                const isLedge = adjacent
                    .map((pt) => location.levels?.get(pt))
                    .some((level) => level < thisLevel)
                if (isLedge) {
                    location.setGroundElement(GroundType.LEDGE, pt)
                } else {
                    location.setGroundElement(GroundType.GRASS, pt)
                }
            }
        }
    }

    ////////////
    // Water! //
    ////////////

    protected placeWater(location: Location, presetWater: Grid<boolean> = new Grid()) {
        presetWater.entries().forEach(([pt]) => {
            location.setGroundElement(GroundType.WATER, pt)
        })

        let waterVolume = location.range * location.range * 0.06
        for (let i = 0; i < 50; i++) {
            const tilesPlaced = this.tryPlaceWater(location)
            waterVolume -= tilesPlaced
            if (waterVolume < 0) {
                console.log("short circuiting, there's enough water")
                return
            }
        }
        console.log("didn't meet water goal")
    }

    private tryPlaceWater(location: Location) {
        const [pts] = this.waterNoise(location.range)
        if (pts.length < MIN_WATER_SIZE || pts.length > MAX_WATER_SIZE) {
            return 0
        }
        // Check the placement
        for (const pt of pts) {
            const type = location.getGround(pt)?.type
            if (type !== GroundType.GRASS) {
                return 0
            }
        }
        pts.forEach((pt) => {
            location.setGroundElement(GroundType.WATER, pt)
        })
        return pts.length
    }

    /**
     * @returns null if nothing crosses the threshold
     */
    private waterNoise(
        mapRange: number,
        threshold: number = 0.85,
        seed = Math.random()
    ): [Point[], string] {
        const noise = new Noise(seed)

        const pts: Point[] = []
        let str = `seed: ${seed} \n`
        const noiseScale = 1

        for (let i = -mapRange - 1; i < mapRange + 1; i++) {
            for (let j = -mapRange - 1; j < mapRange + 1; j++) {
                var value = noise.simplex2(i / (mapRange * noiseScale), j / (mapRange * noiseScale))
                value = (value + 1) / 2 // scale to 0-1
                if (value > threshold) {
                    str += "W"
                    pts.push(new Point(j, i))
                } else {
                    str += " "
                }
            }
            str += "\n"
        }

        return [pts, str]
    }

    //////////////
    // Foliage! //
    //////////////

    protected spawnTreesAtEdge(location: Location, treeTypeSupplier?: TreeTypeSupplier) {
        const vignetteEdge = location.range - 1
        const treeline = vignetteEdge - 8

        const possibilities = []
        for (let x = -location.range; x < location.range; x++) {
            for (let y = -location.range - 1; y < location.range; y++) {
                const distToCenter = new Point(x, y).distanceTo(Point.ZERO)
                const pt = new Point(x, y)
                if (distToCenter > vignetteEdge) {
                    possibilities.push(pt)
                } else if (distToCenter > treeline) {
                    const chance = (distToCenter - treeline) / (vignetteEdge - treeline)
                    if (Math.random() < chance) {
                        possibilities.push(pt)
                    }
                }
            }
        }
        Lists.shuffle(possibilities)
        possibilities.forEach((pt) => this.spawnTree(location, pt, treeTypeSupplier))
    }

    protected spawnTrees(location: Location, treeTypeSupplier?: TreeTypeSupplier) {
        const treeAmountRange = (location.size * location.size) / 12
        const trees = Math.random() * treeAmountRange + treeAmountRange
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * location.range * 2) - location.range,
                Math.floor(Math.random() * (location.range * 2 - 1)) - location.range
            )
            this.spawnTree(location, pt, treeTypeSupplier)
        }
    }

    private spawnTree(
        location: Location,
        pt: Point,
        treeTypeSupplier: TreeTypeSupplier = () =>
            Math.random() < 0.7 ? ElementType.TREE_POINTY : ElementType.TREE_ROUND
    ) {
        const treeBase = pt.plusY(1)
        if (location.getGround(treeBase)?.type !== GroundType.GRASS) {
            return
        }
        location.addElement(
            treeTypeSupplier(),
            pt,
            { s: 3 } // make adult trees
        )
    }

    ////////////////////
    // Miscellaneous! //
    ////////////////////

    protected spawn(location: Location, element: ElementType, count: number) {
        let placed = 0
        while (placed < count) {
            const p = new Point(
                Math.floor(Math.random() * location.size) - location.range,
                Math.floor(Math.random() * location.size) - location.range
            )
            if (location.addElement(element, p)) {
                placed++
            }
        }
    }
}
