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

    private static readonly MAP_SIZE = 70

    private readonly location = LocationManager.instance.add(
        new WorldLocation(false, true, MapGenerator.MAP_SIZE, MapGenerator.noise(4))
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

    private static VIGNETTE_EDGE = MapGenerator.MAP_SIZE/2 - 1
    private static TREELINE = MapGenerator.VIGNETTE_EDGE - 8

    private spawnTreesAtEdge() {
        const possibilities = []
        for (let x = -MapGenerator.MAP_SIZE/2; x < MapGenerator.MAP_SIZE/2; x++) {
            for (let y = -MapGenerator.MAP_SIZE/2; y < MapGenerator.MAP_SIZE/2; y++) {
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
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE/2,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE-1)) - MapGenerator.MAP_SIZE/2,
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
        for (let x = MapGenerator.MAP_SIZE/2-11; x < MapGenerator.MAP_SIZE/2 + 10; x++) {
            for (let y = MapGenerator.MAP_SIZE/2-25; y < MapGenerator.MAP_SIZE/2-23; y++) {
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
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE/2,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE)) - MapGenerator.MAP_SIZE/2,
            )
            if (this.location.ground.get(p)?.type === GroundType.GRASS && this.location.addElement(element, p)) {
                placed++
            }
        }
    }

    private placeGrass() {
        for (let i = -MapGenerator.MAP_SIZE/2; i < MapGenerator.MAP_SIZE/2; i++) {
            for (let j = -MapGenerator.MAP_SIZE/2; j < MapGenerator.MAP_SIZE/2; j++) {
                const pt = new Point(i, j)
                // TODO revisit levels
                const edgesEnabled = false
                const thisLevel = this.location.levels.get(pt)
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
                        .map(pt => this.location.levels.get(pt))
                        .some(level => level < thisLevel)
                if (isLedge && edgesEnabled) {
                    this.location.setGroundElement(GroundType.LEDGE, pt)
                } else {
                    this.location.setGroundElement(GroundType.GRASS, pt)
                }
            }
        }
    }

    /**
     * @param levels the number of levels
     * @returns a grid of numbers the size of the map
     */
    static noise(levels: number): Grid<number> {
        const noise = new Noise(Math.random())

        const grid = new Grid<number>()
        let str = ""

        // Each entry will occupy a 2x2 tile section to prevent 
        // 1-wide entries that are hard to make work art-wise

        for (let i = -MapGenerator.MAP_SIZE/2; i < MapGenerator.MAP_SIZE/2; i += 2) {
            for (let j = -MapGenerator.MAP_SIZE/2; j < MapGenerator.MAP_SIZE/2; j += 2) {
                var value = noise.simplex2(i / 100, j / 100);
                value = (value + 1)/2  // scale to 0-1
                const v = Math.floor(levels * value)
                str += v

                grid.set(new Point(j, i), v)
                grid.set(new Point(j+1, i+1), v)
                grid.set(new Point(j+1, i), v)
                grid.set(new Point(j, i+1), v)
            }
            str += "\n"
        }

        console.log(str)
        return grid
    }
}

window["noise"] = MapGenerator.noise