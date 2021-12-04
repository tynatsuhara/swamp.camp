import { Point } from "brigsby/dist/Point"
import { Grid } from "brigsby/dist/util/Grid"
import { Lists } from "brigsby/dist/util/Lists"
import { Noise } from "brigsby/dist/util/Noise"
import { Singletons } from "../Singletons"
import { ElementType } from "./elements/Elements"
import { TentColor } from "./elements/Tent"
import { GroundType } from "./ground/Ground"
import { Location } from "./Location"
import { LocationManager, LocationType } from "./LocationManager"

export class MapGenerator {
    static get instance() {
        return Singletons.getOrCreate(MapGenerator)
    }

    private static readonly MAP_RANGE = 40
    /**
     * The map goes from [-MAP_RANGE, MAP_RANGE], although some of the grids extend
     * one tile further in each direction to prevent janky cutoffs at the edge
     */
    private static readonly MAP_SIZE = MapGenerator.MAP_RANGE * 2

    private location: Location
    private readonly tentPos = new Point(-3, -3)

    generateExterior(): Location {
        for (let elementsPlaced = false, attempt = 1; !elementsPlaced; attempt++) {
            console.log(`generation attept ${attempt}`)

            this.location = new Location(
                LocationType.BASE_CAMP,
                false,
                true,
                MapGenerator.MAP_SIZE,
                MapGenerator.levels()
            )

            // make the ground
            this.placeGround()
            this.placeWater()

            // spawn tent
            const tent = this.location.addElement(ElementType.TENT, this.tentPos, {
                color: TentColor.RED,
            })

            // if the tent couldn't be placed, redo the map topography
            elementsPlaced = !!tent
        }

        this.spawnTreesAtEdge()
        this.spawnTrees()
        this.spawn(ElementType.ROCK, 15 + Math.random() * 10)
        this.clearPathToCenter()

        // TODO short trees, bushes, fruit, tall grass, etc
        this.spawn(ElementType.MUSHROOM, 3 + Math.random() * 5)

        LocationManager.instance.add(this.location)
        LocationManager.instance.currentLocation = this.location

        return this.location
    }

    private static VIGNETTE_EDGE = MapGenerator.MAP_RANGE - 1
    private static TREELINE = MapGenerator.VIGNETTE_EDGE - 8

    private spawnTreesAtEdge() {
        const possibilities = []
        for (let x = -MapGenerator.MAP_RANGE; x < MapGenerator.MAP_RANGE; x++) {
            for (let y = -MapGenerator.MAP_RANGE; y < MapGenerator.MAP_RANGE; y++) {
                const distToCenter = new Point(x, y).distanceTo(Point.ZERO)
                const pt = new Point(x, y)
                if (distToCenter > MapGenerator.VIGNETTE_EDGE) {
                    possibilities.push(pt)
                } else if (distToCenter > MapGenerator.TREELINE) {
                    const chance =
                        (distToCenter - MapGenerator.TREELINE) /
                        (MapGenerator.VIGNETTE_EDGE - MapGenerator.TREELINE)
                    if (Math.random() < chance) {
                        possibilities.push(pt)
                    }
                }
            }
        }
        Lists.shuffle(possibilities)
        possibilities.forEach((pt) => this.spawnTree(pt))
    }

    private spawnTrees() {
        const trees = Math.random() * 500 + 500
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_RANGE,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE - 1)) - MapGenerator.MAP_RANGE
            )
            this.spawnTree(pt)
        }
    }

    private spawnTree(pt: Point) {
        const treeBase = pt.plusY(1)
        if (this.location.getGround(treeBase)?.type !== GroundType.GRASS) {
            return
        }
        this.location.addElement(
            Math.random() < 0.7 ? ElementType.TREE_POINTY : ElementType.TREE_ROUND,
            pt,
            { s: 3 } // make adult trees
        )
    }

    private clearPathToCenter() {
        const typesToClear = [ElementType.ROCK, ElementType.TREE_POINTY, ElementType.TREE_ROUND]

        // clear in corner
        for (let x = MapGenerator.MAP_RANGE - 11; x < MapGenerator.MAP_RANGE + 10; x++) {
            for (let y = MapGenerator.MAP_RANGE - 25; y < MapGenerator.MAP_RANGE - 23; y++) {
                const element = this.location.getElement(new Point(x, y))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    this.location.removeElement(element)
                }
            }
        }

        // clear around tent
        const clearingCorner = this.tentPos.minus(new Point(1, 0))
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 4; y++) {
                const element = this.location.getElement(clearingCorner.plus(new Point(x, y)))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    this.location.removeElement(element)
                }
            }
        }
    }

    private spawn(element: ElementType, count: number) {
        let placed = 0
        while (placed < count) {
            const p = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_RANGE,
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_RANGE
            )
            if (
                this.location.getGround(p)?.type === GroundType.GRASS &&
                this.location.addElement(element, p)
            ) {
                placed++
            }
        }
    }

    private placeGround() {
        for (let i = -MapGenerator.MAP_RANGE - 1; i < MapGenerator.MAP_RANGE + 1; i++) {
            for (let j = -MapGenerator.MAP_RANGE - 1; j < MapGenerator.MAP_RANGE + 1; j++) {
                const pt = new Point(i, j)
                const thisLevel = this.location.levels?.get(pt)
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
                    .map((pt) => this.location.levels.get(pt))
                    .some((level) => level < thisLevel)
                if (isLedge) {
                    this.location.setGroundElement(GroundType.LEDGE, pt)
                } else {
                    this.location.setGroundElement(GroundType.GRASS, pt)
                }
            }
        }
    }

    static levels() {
        // We want more bottom ledges than top because it looks nicer with the camera "angle"
        const topBottomThreshold = 0.3
        const sideBottomThreshold = 1

        let levelGrid: Grid<number>
        let levelString: string
        let topBottomRatio: number
        let sideBottomRatio: number

        do {
            ;[levelGrid, levelString, topBottomRatio, sideBottomRatio] = this.levelNoise()
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
    static levelNoise(
        levels: number = 3,
        seed = Math.random()
    ): [Grid<number>, string, number, number] {
        const noise = new Noise(seed)

        const grid = new Grid<number>()
        let str = `seed: ${seed} \n`

        // Should be divisible by 2 and a divisor of MAP_SIZE
        const sq = 2
        const noiseScale = 2.5

        // Each entry will occupy a sq x sq tile section to prevent
        // 1-wide entries that are hard to make work art-wise
        // TODO: Smooth out edges to prevent stair-step pattern?

        let bottomLedges = 0
        let topLedges = 0
        let sideLedges = 0

        for (let i = -MapGenerator.MAP_RANGE - 1; i < MapGenerator.MAP_RANGE + 1; i += sq) {
            for (let j = -MapGenerator.MAP_RANGE - 1; j < MapGenerator.MAP_RANGE + 1; j += sq) {
                var value = noise.simplex2(
                    i / (this.MAP_RANGE * noiseScale),
                    j / (this.MAP_RANGE * noiseScale)
                )
                value = (value + 1) / 2 // scale to 0-1
                const level = Math.floor(levels * value)
                str += level

                // Compare top/bottom ratio
                const above = grid.get(new Point(j, i - 1))
                if (above != null) {
                    if (above < level) {
                        topLedges++
                    } else if (above > level) {
                        bottomLedges++
                    }
                }

                const left = grid.get(new Point(j - 1, i))
                const right = grid.get(new Point(j + 1, i))
                if ((left != null && left !== level) || (right != null && right !== level)) {
                    sideLedges++
                }

                for (let m = 0; m < sq; m++) {
                    for (let n = 0; n < sq; n++) {
                        grid.set(new Point(j + m, i + n), level)
                    }
                }
            }
            str += "\n"
        }

        str += `top ledges = ${topLedges}\n`
        str += `bottom ledges = ${bottomLedges}\n`
        str += `ratio top/bottom = ${topLedges / bottomLedges}\n`
        str += `side ledges = ${sideLedges}\n`
        str += `ratio side/bottom = ${sideLedges / bottomLedges}\n`

        return [grid, str, topLedges / bottomLedges, sideLedges / bottomLedges]
    }

    placeWater() {
        let waterVolume = MapGenerator.MAP_SIZE * MapGenerator.MAP_SIZE * 0.06
        for (let i = 0; i < 50; i++) {
            const tilesPlaced = this.tryPlaceWater()
            waterVolume -= tilesPlaced
            if (waterVolume < 0) {
                console.log("short circuiting, there's enough water")
                return
            }
        }
        console.log("didn't meet water goal")
    }

    private static readonly MIN_WATER_SIZE = 50
    private static readonly MAX_WATER_SIZE = 500

    private tryPlaceWater() {
        const [pts] = MapGenerator.waterNoise()
        if (pts.length < MapGenerator.MIN_WATER_SIZE || pts.length > MapGenerator.MAX_WATER_SIZE) {
            return 0
        }
        // Check the placement
        for (const pt of pts) {
            const type = this.location.getGround(pt)?.type
            if (type !== GroundType.GRASS) {
                return 0
            }
        }
        pts.forEach((pt) => {
            this.location.setGroundElement(GroundType.WATER, pt)
        })
        return pts.length
    }

    /**
     * @returns null if nothing crosses the threshold
     */
    static waterNoise(threshold: number = 0.85, seed = Math.random()): [Point[], string] {
        const noise = new Noise(seed)

        const pts: Point[] = []
        let str = `seed: ${seed} \n`
        let validResult = false
        const noiseScale = 1

        for (let i = -MapGenerator.MAP_RANGE - 1; i < MapGenerator.MAP_RANGE + 1; i++) {
            for (let j = -MapGenerator.MAP_RANGE - 1; j < MapGenerator.MAP_RANGE + 1; j++) {
                var value = noise.simplex2(
                    i / (this.MAP_RANGE * noiseScale),
                    j / (this.MAP_RANGE * noiseScale)
                )
                value = (value + 1) / 2 // scale to 0-1
                if (value > threshold) {
                    str += "W"
                    validResult = true
                    pts.push(new Point(j, i))
                } else {
                    str += " "
                }
            }
            str += "\n"
        }

        return [pts, str]
    }
}

window["levelNoise"] = (...args: any) => {
    const result = MapGenerator.levelNoise(...args)
    console.log(result[2])
}

window["waterNoise"] = (...args: any) => {
    const result = MapGenerator.waterNoise(...args)
    console.log(result[1])
}
