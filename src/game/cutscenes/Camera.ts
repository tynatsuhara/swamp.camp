import { Point } from "../../engine/point"
import { MapGenerator } from "../world/MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Dude } from "../characters/Dude"

export class Camera {

    private static _instance: Camera
    static get instance(): Camera {
        if (!this._instance) {
            this._instance = new Camera()
        }
        return this._instance
    }

    private constructor() {
        Camera._instance = this
    }

    private dudeTarget: Dude
    private pointTarget: Point

    private _position: Point
    get position() { 
        return this._position.times(-1)  // multiply by -1 because views use "offset"
    }
    private _dimensions: Point
    get dimensions() { return this._dimensions }

    shake(power: number, duration: number) {
        
    }

    focusOnDude(dude: Dude) {
        this.dudeTarget = dude
        this.pointTarget = null
    }

    focusOnPoint(point: Point) {
        this.pointTarget = point
        this.dudeTarget = null
    }

    jump(translation: Point) {
        this._position = this._position.plus(translation)
    }

    getUpdatedPosition(dimensions: Point, elapsedTimeMillis: number): Point {
        this._dimensions = dimensions
        const xLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.x/2
        const yLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - dimensions.y/2
        const trackedPoint = this.dudeTarget?.position ?? this.pointTarget
        const clampedTrackedPoint = new Point(
            this.clamp(trackedPoint.x, -xLimit, xLimit),
            this.clamp(trackedPoint.y, -yLimit, yLimit)
        )
        const cameraGoal = dimensions.div(2).minus(clampedTrackedPoint)

        if (!this._position) {
            this._position = cameraGoal
        } else {
            this._position = this._position.lerp(.0018 * elapsedTimeMillis, cameraGoal)
        }

        return this._position
    }

    private clamp(val: number, min: number, max: number) {
        return Math.min(Math.max(val, min), max)
    }
}