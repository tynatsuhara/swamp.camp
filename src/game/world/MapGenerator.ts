import { Point } from "../../engine/point"
import { ConnectingTile } from "../../engine/tiles/ConnectingTile"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { WorldLocation } from "./WorldLocation"
import { TentColor } from "./elements/Tent"
import { ElementType } from "./elements/Elements"
import { LocationManager } from "./LocationManager"
import { GroundType, Ground } from "./ground/Ground"
import { Noise } from "../../engine/util/Noise"
import { Grid } from "../../engine/util/Grid"
import { TILE_SIZE } from "../graphics/Tilesets"


export class MapGenerator {

    static readonly MAP_SIZE = 50
    static readonly ENTER_LAND_POS = new Point(1, 1).times(MapGenerator.MAP_SIZE/2 * TILE_SIZE).plusY(-TILE_SIZE * 10).plusX(TILE_SIZE * 2)

    private readonly location = LocationManager.instance.newLocation(false)
    private readonly tentPos = new Point(-3, -3)

    doIt(): WorldLocation {
        // spawn tent
        this.location.addWorldElement(ElementType.TENT, this.tentPos, { color: TentColor.RED })
        
        // make the ground
        // this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
        // this.renderPath(new Point(10, -10), new Point(-10, 10), 5)

        this.spawnTrees()
        this.spawnRocks()
        this.clearPathToCenter()

        // TODO short trees, bushes, fruit, tall grass, etc

        // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
        this.placeGrass()

        return this.location
    }

    spawnTrees() {
        const trees = Math.random() * 300 + 150
        for (let i = 0; i < trees; i++) {
            const pt = new Point(
                Math.floor(Math.random() * MapGenerator.MAP_SIZE) - MapGenerator.MAP_SIZE/2,
                Math.floor(Math.random() * (MapGenerator.MAP_SIZE-1)) - MapGenerator.MAP_SIZE/2,
            )
            const occupiedPoints = [pt, pt.plus(new Point(0, 1))]
            if (occupiedPoints.every(p => !this.location.ground.get(p))) {
                this.location.addWorldElement(ElementType.TREE, pt)
            }
        }
    }

    clearPathToCenter() {
        const typesToClear = [ElementType.ROCK, ElementType.TREE]
        // these are magic numbers based on the intro cutscene 
        for (let x = 14; x < MapGenerator.MAP_SIZE/2; x++) {
            for (let y = 15; y < 17; y++) {
                const element = this.location.elements.get(new Point(x, y))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    this.location.elements.removeAll(element)
                }
            }
        }
        const clearingCorner = this.tentPos.minus(new Point(1, 0))
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 4; y++) {
                const element = this.location.elements.get(clearingCorner.plus(new Point(x, y)))
                if (!!element && typesToClear.indexOf(element.type) !== -1) {
                    this.location.elements.removeAll(element)
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
            if (!this.location.ground.get(p) && this.location.addWorldElement(ElementType.ROCK, p)) {
                placedRocks++
            }
        }
    }

    renderPath(
        start: Point, 
        end: Point, 
        randomness: number
    ) {
        const ground = this.location.ground
        const stuff = this.location.elements

        const heuristic = (pt: Point): number => {
            const v = pt.distanceTo(end) * Math.random() * randomness
            const el = ground.get(pt)
            if (!el) {
                return v
            }
            const ct = el.entity.getComponent(ConnectingTile)
            if (!ct || !ct.schema.canConnect(Ground.instance.PATH_CONNECTING_SCHEMA)) {
                return v
            }
            const reuseCostMultiplier = 1/10
            return v * reuseCostMultiplier
        }

        const isOccupiedFunc = (pt: Point) => {
            if (!!stuff.get(pt)?.entity.getComponent(BoxCollider)) {
                return true
            }
            const el = ground.get(pt)
            if (!el) {
                return false  // definitely not occupied
            }
            const ct = el.entity.getComponent(ConnectingTile)
            if (!ct) {
                return true  // can't connect, therefore occupied
            }
            return !Ground.instance.PATH_CONNECTING_SCHEMA.canConnect(ct.schema)
        }

        const path = ground.findPath(
            start, 
            end, 
            heuristic, 
            isOccupiedFunc
        )

        if (!path) {
            return
        }

        path.forEach(pt => this.location.addGroundElement(GroundType.PATH, pt))
    }

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
                const v = (Math.floor(2 * (value + 1)))
                str += v
                grid.set(new Point(j, i), v)
            }
            str += "\n"
        }

        console.log(str)
        return grid
    }
}