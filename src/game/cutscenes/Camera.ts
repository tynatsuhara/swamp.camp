import { Point } from "../../engine/Point"
import { MapGenerator } from "../world/MapGenerator"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Dude } from "../characters/Dude"
import { clamp } from "../../engine/util/Utils"
import { Renderer } from "../../engine/renderer/Renderer"
import { Singletons } from "../Singletons"

export class Camera {

    static readonly ZOOM = 3

    static get instance() {
        return Singletons.getOrCreate(Camera)
    }

    private shakePower: number
    private shakeDuration: number

    private dudeTarget: Dude
    private pointTarget: Point

    private _position: Point
    private shakeOffset = Point.ZERO
    get position() { 
        // multiply by -1 because views use "offset"
        return this._position.times(-1).minus(this.shakeOffset)
    }
    get dimensions() { return Renderer.instance.getDimensions().div(Camera.ZOOM) }

    shake(power: number, duration: number) {
        this.shakePower = power
        this.shakeDuration = duration
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

    getUpdatedPosition(elapsedTimeMillis: number): Point {
        let xLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - this.dimensions.x/2
        let yLimit = MapGenerator.MAP_SIZE / 2 * TILE_SIZE - this.dimensions.y/2
        
        if (this.dimensions.x > MapGenerator.MAP_SIZE * TILE_SIZE) {
            xLimit = Number.MAX_SAFE_INTEGER
        }
        if (this.dimensions.y > MapGenerator.MAP_SIZE * TILE_SIZE) {
            yLimit = Number.MAX_SAFE_INTEGER
        }

        const trackedPoint = this.dudeTarget?.position ?? this.pointTarget
        const clampedTrackedPoint = new Point(
            clamp(trackedPoint.x, -xLimit, xLimit),
            clamp(trackedPoint.y, -yLimit, yLimit)
        )
        const cameraGoal = this.dimensions.div(2).minus(clampedTrackedPoint)

        if (!this._position) {
            this._position = cameraGoal
        } else {
            this._position = this._position.lerp(.0018 * elapsedTimeMillis, cameraGoal)
        }

        if (this.shakeDuration > 0) {
            this.shakePower *= (1-elapsedTimeMillis/this.shakeDuration)
            this.shakeDuration -= elapsedTimeMillis
            this.shakeOffset = new Point(Math.random() - .5, Math.random() - .5).times(this.shakePower)
        }

        return this._position.plus(this.shakeOffset)
    }
}