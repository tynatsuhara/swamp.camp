import { debug } from "../../engine/Debug"
import { Point } from "../../engine/Point"
import { Grid } from "../../engine/util/Grid"
import { Lists } from "../../engine/util/Lists"
import { Noise } from "../../engine/util/Noise"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { ElementType } from "./elements/Elements"
import { TentColor } from "./elements/Tent"
import { GroundType } from "./ground/Ground"
import { LocationManager } from "./LocationManager"
import { WorldLocation } from "./WorldLocation"


export class MapGenerator {

    static get instance() {
        return Singletons.getOrCreate(MapGenerator)
    }

    private static readonly MAP_RANGE = 40
    private static readonly MAP_SIZE = MapGenerator.MAP_RANGE * 2  // map goes from [-MAP_RANGE, MAP_RANGE]

    private readonly location = LocationManager.instance.add(
        new WorldLocation(false, true, MapGenerator.MAP_SIZE, MapGenerator.levels())
    )
    private readonly tentPos = new Point(-3, -3)

    generateExterior(): WorldLocation {
        // spawn tent
        this.location.addElement(ElementType.TENT, this.tentPos, { color: TentColor.RED })
        
        // make the ground
        // this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
        // this.renderPath(new Point(10, -10), new Point(-10, 10), 5)
        this.placeGrass()

        this.spawnTreesAtEdge()
        this.spawnTrees()
        this.spawn(ElementType.ROCK, 15 + Math.random() * 10)
        this.clearPathToCenter()

        // TODO short trees, bushes, fruit, tall grass, etc
        this.spawn(ElementType.MUSHROOM, 3 + Math.random() * 5)

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
                    const chance = (distToCenter - MapGenerator.TREELINE) / (MapGenerator.VIGNETTE_EDGE - MapGenerator.TREELINE)
                    if (Math.random() < chance) {
                        possibilities.push(pt)
                    }
                }
            }
        }
        Lists.shuffle(possibilities)
        possibilities.forEach(pt => this.spawnTree(pt))
    }

    private spawnTrees() {
        const trees = Math.random() * 500 + 500
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_RANGE,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE-1)) - MapGenerator.MAP_RANGE,
            )
            this.spawnTree(pt)
        }
    }

    private spawnTree(pt: Point) {
        const treeBase = pt.plusY(1)
        if (this.location.ground.get(treeBase)?.type !== GroundType.GRASS) {
            return
        }
        this.location.addElement(
            Math.random() < .7 ? ElementType.TREE_POINTY : ElementType.TREE_ROUND,
            pt,
            { s: 3 }  // make adult trees
        )
    }

    private clearPathToCenter() {
        const typesToClear = [ElementType.ROCK, ElementType.TREE_POINTY, ElementType.TREE_ROUND]

        // clear in corner
        for (let x = MapGenerator.MAP_RANGE-11; x < MapGenerator.MAP_RANGE + 10; x++) {
            for (let y = MapGenerator.MAP_RANGE-25; y < MapGenerator.MAP_RANGE-23; y++) {
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
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE)) - MapGenerator.MAP_RANGE,
            )
            if (this.location.ground.get(p)?.type === GroundType.GRASS && this.location.addElement(element, p)) {
                placed++
            }
        }
    }

    private placeGrass() {
        for (let i = -MapGenerator.MAP_RANGE; i < MapGenerator.MAP_RANGE; i++) {
            for (let j = -MapGenerator.MAP_RANGE; j < MapGenerator.MAP_RANGE; j++) {
                const pt = new Point(i, j)
                // TODO revisit levels
                const levelsEnabled = debug.enableVerticality
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
                const isLedge = levelsEnabled && adjacent
                        .map(pt => this.location.levels.get(pt))
                        .some(level => level < thisLevel)
                if (isLedge) {
                    this.location.setGroundElement(GroundType.LEDGE, pt)
                } else {
                    this.location.setGroundElement(GroundType.GRASS, pt)
                }
            }
        }
    }

    static levels() {
        if (!debug.enableVerticality) {
            return null
        }

        // We want more bottom ledges than top because it looks nicer with the camera "angle"
        const threshold = .3

        let result: [Grid<number>, number, string] = [null, 1, null]
        while (result[1] > threshold) {
            result = this.noise()
        }

        console.log(result[2])

        return result[0]
    }

    /**
     * @param levels the number of levels
     * @returns a grid of numbers the size of the map and the ratio of top/bottom ledges
     */
    static noise(levels: number = 3, seed = Math.random()): [Grid<number>, number, string] {
        const noise = new Noise(seed)

        const grid = new Grid<number>()
        let str = `seed: ${seed} \n`

        // Should be divisible by 2 and a divisor of MAP_SIZE
        const sq = 2

        // Each entry will occupy a sq x sq tile section to prevent 
        // 1-wide entries that are hard to make work art-wise
        // TODO: Smooth out edges to prevent stair-step pattern?

        let bottomLedges = 0
        let topLedges = 0

        for (let i = -MapGenerator.MAP_RANGE; i < MapGenerator.MAP_RANGE; i += sq) {
            for (let j = -MapGenerator.MAP_RANGE; j < MapGenerator.MAP_RANGE; j += sq) {
                var value = noise.simplex2(i / 100, j / 100);
                value = (value + 1)/2  // scale to 0-1
                const v = Math.floor(levels * value)
                str += v

                // Compare top/bottom ratio
                const above = grid.get(new Point(j, i-1))
                if (above != null) {
                    if (above < v) {
                        topLedges++
                    } else if (above > v) {
                        bottomLedges++
                    }
                }

                for (let m = 0; m < sq; m++) {
                    for (let n = 0; n < sq; n++) {
                        grid.set(new Point(j+m, i+n), v)
                    }
                }
            }
            str += "\n"
        }

        str += `top ledges = ${topLedges}\nbottom ledges = ${bottomLedges}\nratio top/bottom = ${topLedges/bottomLedges}`

        return [grid, topLedges/bottomLedges, str]
    }
}

window["noise"] = (...args: any) => {
    const result = MapGenerator.noise(args)
    console.log(result[2])
}