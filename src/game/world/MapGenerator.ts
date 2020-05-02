import { Point } from "../../engine/point"
import { ConnectingTile } from "../../engine/tiles/ConnectingTile"
import { BoxCollider } from "../../engine/collision/BoxCollider"
import { WorldLocation } from "./WorldLocation"
import { TentColor } from "./elements/Tent"
import { ElementType } from "./elements/Elements"
import { LocationManager } from "./LocationManager"
import { GroundType, Ground } from "./ground/Ground"


export class MapGenerator {

    static readonly MAP_SIZE = 50

    private readonly location = LocationManager.instance.newLocation()

    doIt(): WorldLocation {
        const tentLocation = LocationManager.instance.newLocation()
        
        // spawn tent
        this.location.addWorldElement(ElementType.TENT, new Point(5, 5), tentLocation.uuid, TentColor.RED)

        // spawn campfire
        const campfirePos = new Point(3, 9)
        this.location.addWorldElement(ElementType.CAMPFIRE, campfirePos)
        
        // make the ground
        this.renderPath(new Point(-10, -10), new Point(10, 10), 2)
        this.renderPath(new Point(10, -10), new Point(-10, 10), 5)

        this.spawnTrees()
        this.spawnRocks()

        // TODO short trees, bushes, fruit, tall grass, etc

        // spawn grass last, stuff checks for existing paths prior to this by the lack of ground items
        this.placeGrass()

        return this.location
    }

    spawnTrees() {
        const trees = Math.random() * 150 + 50
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
        for (let i = -MapGenerator.MAP_SIZE/2; i < MapGenerator.MAP_SIZE/2; i++) {
            for (let j = -MapGenerator.MAP_SIZE/2; j < MapGenerator.MAP_SIZE/2; j++) {
                const pt = new Point(i, j)
                this.location.addGroundElement(GroundType.GRASS, pt)
            }
        }
    }
}