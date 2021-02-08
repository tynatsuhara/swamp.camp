import { Point } from "../../engine/point"
import { Grid } from "../../engine/util/Grid"
import { Lists } from "../../engine/util/Lists"
import { Noise } from "../../engine/util/Noise"
import { TILE_SIZE } from "../graphics/Tilesets"
import { ElementType } from "./elements/Elements"
import { TentColor } from "./elements/Tent"
import { GroundType } from "./ground/Ground"
import { LocationManager } from "./LocationManager"
import { WorldLocation } from "./WorldLocation"


export class MapGenerator {

    private static _instance: MapGenerator
    static get instance(): MapGenerator {
        if (!this._instance) {
            this._instance = new MapGenerator()
        }
        return this._instance
    }

    private constructor() {
        MapGenerator._instance = this
    }

    static readonly MAP_SIZE = 70
    static readonly ENTER_LAND_POS = new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE).plusY(-TILE_SIZE * 25).plusX(TILE_SIZE * 2)

    private readonly location = LocationManager.instance.add(new WorldLocation(false, true))
    private readonly tentPos = new Point(-3, -3)

    generateExterior(): WorldLocation {
        // spawn tent
        this.location.addElement(ElementType.TENT, this.tentPos, { color: TentColor.RED })
        
        // make the ground
        // this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
        // this.renderPath(new Point(10, -10), new Point(-10, 10), 5)

        this.spawnTreesAtEdge()
        this.spawnTrees()
        this.spawnRocks()
        this.clearPathToCenter()

        // TODO short trees, bushes, fruit, tall grass, etc

        // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
        this.placeGrass()

        return this.location
    }

    spawnTreesAtEdge() {
        const treeStopEdge = MapGenerator.MAP_SIZE
        const vignetteEdge = MapGenerator.MAP_SIZE/2 - 1
        const denseStartEdge = vignetteEdge - 8
        const possibilities = []
        for (let x = -MapGenerator.MAP_SIZE/2; x < MapGenerator.MAP_SIZE; x++) {
            for (let y = -MapGenerator.MAP_SIZE/2; y < MapGenerator.MAP_SIZE; y++) {
                const distToCenter = new Point(x, y).distanceTo(Point.ZERO)
                const pt = new Point(x, y)
                if (distToCenter > treeStopEdge ) {
                    // do nothing -- behind the vignette
                } else if (distToCenter > vignetteEdge) {
                    possibilities.push(pt)
                } else if (distToCenter > denseStartEdge) {
                    const chance = (distToCenter - denseStartEdge) / (vignetteEdge - denseStartEdge)
                    if (Math.random() < chance) {
                        possibilities.push(pt)
                    }
                }
            }
        }
        Lists.shuffle(possibilities)
        possibilities.forEach(pt => this.spawnTree(pt))
    }

    spawnTrees() {
        const trees = Math.random() * 300 + 150
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE/2,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE-1)) - MapGenerator.MAP_SIZE/2,
            )
            this.spawnTree(pt)
        }
    }

    private spawnTree(pt: Point) {
        this.location.addElement(
            Math.random() < .7 ? ElementType.TREE_POINTY : ElementType.TREE_ROUND,
            pt,
            { s: 3 }  // make adult trees
        )
    }

    clearPathToCenter() {
        const typesToClear = [ElementType.ROCK, ElementType.TREE_POINTY, ElementType.TREE_ROUND]

        // clear in corner
        for (let x = MapGenerator.MAP_SIZE/2-11; x < MapGenerator.MAP_SIZE/2; x++) {
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

    spawnRocks() {
        let placedRocks = 0
        while (placedRocks < 20) {
            const p = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE/2,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE)) - MapGenerator.MAP_SIZE/2,
            )
            if (!this.location.ground.get(p) && this.location.addElement(ElementType.ROCK, p)) {
                placedRocks++
            }
        }
    }

    // renderPath(
    //     start: Point, 
    //     end: Point, 
    //     randomness: number
    // ) {
    //     const ground = this.location.ground
    //     const stuff = this.location.elements

    //     const heuristic = (pt: Point): number => {
    //         const v = pt.manhattanDistanceTo(end) * Math.random() * randomness
    //         const el = ground.get(pt)
    //         if (!el) {
    //             return v
    //         }
    //         const ct = el.entity.getComponent(ConnectingTile)
    //         if (!ct || !ct.schema.canConnect(Ground.instance.PATH_CONNECTING_SCHEMA)) {
    //             return v
    //         }
    //         const reuseCostMultiplier = 1/10
    //         return v * reuseCostMultiplier
    //     }

    //     const isOccupiedFunc = (pt: Point) => {
    //         if (!!stuff.get(pt)?.entity.getComponent(BoxCollider)) {
    //             return true
    //         }
    //         const el = ground.get(pt)
    //         if (!el) {
    //             return false  // definitely not occupied
    //         }
    //         const ct = el.entity.getComponent(ConnectingTile)
    //         if (!ct) {
    //             return true  // can't connect, therefore occupied
    //         }
    //         return !Ground.instance.PATH_CONNECTING_SCHEMA.canConnect(ct.schema)
    //     }

    //     const path = ground.findPath(
    //         start, 
    //         end, 
    //         { 
    //             heuristic: heuristic,  
    //             isOccupied: isOccupiedFunc
    //         }
    //     )

    //     if (!path) {
    //         return
    //     }

    //     path.forEach(pt => this.location.addGroundElement(GroundType.PATH, pt))
    // }

    placeGrass() {
        // const levels = this.noise()

        for (let i = -MapGenerator.MAP_SIZE/2; i < MapGenerator.MAP_SIZE/2; i++) {
            for (let j = -MapGenerator.MAP_SIZE/2; j < MapGenerator.MAP_SIZE/2; j++) {
                const pt = new Point(i, j)
                // TODO revisit levels
                // const thisLevel = levels.get(pt)
                const isLedge = false //[pt.plusY(1), pt.plusY(-1), pt.plusX(1), pt.plusX(-1)]
                        // .map(pt => levels.get(pt))
                        // .some(level => level < thisLevel)
                if (isLedge) {
                    this.location.addGroundElement(GroundType.LEDGE, pt)
                } else {
                    this.location.addGroundElement(GroundType.GRASS, pt)
                }
            }
        }
    }

    private noise(): Grid<number> {
        const noise = new Noise(Math.random())

        const grid = new Grid<number>()
        let str = ""

        for (let i = -MapGenerator.MAP_SIZE/2; i < MapGenerator.MAP_SIZE/2; i++) {
            for (let j = -MapGenerator.MAP_SIZE/2; j < MapGenerator.MAP_SIZE/2; j++) {
                var value = noise.simplex2(i / 100, j / 100);
                value = (value + 1)/2  // scale to 0-1
                const v = (Math.floor(9 * value))
                str += v
                grid.set(new Point(j, i), v)
            }
            str += "\n"
        }

        console.log(str)
        return grid
    }
}