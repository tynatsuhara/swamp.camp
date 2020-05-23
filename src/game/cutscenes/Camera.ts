import { Point } from "../../engine/point"
import { MapGenerator } from "../world/MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Dude } from "../characters/Dude"

export class Camera {
    static instance: Camera

    private dudeTarget: Dude
    private pointTarget: Point
    
    constructor() {
        Camera.instance = this
    }

    focusOnDude(dude: Dude) {
        this.dudeTarget = dude
        this.pointTarget = null
    }

    focusOnPoint(point: Point) {
        this.pointTarget = point
        this.dudeTarget = null
    }

    getGoalPosition(dimensions: Point): Point {
        const xLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.x/2
        const yLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.y/2
        const trackedPoint = this.dudeTarget?.position ?? this.pointTarget
        const clampedPlayerPos = new Point(
            this.clamp(trackedPoint.x, -xLimit, xLimit),
            this.clamp(trackedPoint.y, -yLimit, yLimit)
        )
        return dimensions.div(2).minus(clampedPlayerPos)
    }

    private clamp(val: number, min: number, max: number) {
        return Math.min(Math.max(val, min), max)
    }
}