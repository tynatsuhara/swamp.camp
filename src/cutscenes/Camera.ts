import { debug, Point } from "brigsby/dist"
import { renderer } from "brigsby/dist/renderer"
import { Maths } from "brigsby/dist/util"
import { Dude } from "../characters/Dude"
import { TILE_SIZE } from "../graphics/Tilesets"
import { Singletons } from "../Singletons"
import { ZOOM } from "../SwampCampGame"
import { here } from "../world/LocationManager"

type FocalPoint = "center" | "top"

export class Camera {
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
    get dimensions() {
        return renderer.getDimensions().div(ZOOM)
    }

    private focalPoint: FocalPoint = "center"

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

    jumpCutToFocalPoint() {
        this._position = this.getGoalPosition()
    }

    setFocalPoint(focalPoint: FocalPoint) {
        this.focalPoint = focalPoint
    }

    getUpdatedPosition(elapsedTimeMillis: number): Point {
        const cameraGoal = this.getGoalPosition()

        if (!this._position) {
            this._position = cameraGoal
        } else {
            this._position = this._position.lerp(0.0018 * elapsedTimeMillis, cameraGoal)
        }

        if (this.shakeDuration > 0) {
            this.shakePower *= 1 - elapsedTimeMillis / this.shakeDuration
            this.shakeDuration -= elapsedTimeMillis
            this.shakeOffset = new Point(Math.random() - 0.5, Math.random() - 0.5).times(
                this.shakePower
            )
        }

        return this._position.plus(this.shakeOffset)
    }

    private getGoalPosition() {
        const mapSize = here().size || 0
        let xLimit = (mapSize / 2) * TILE_SIZE - this.dimensions.x / 2
        let yLimit = (mapSize / 2) * TILE_SIZE - this.dimensions.y / 2

        if (this.dimensions.x > mapSize * TILE_SIZE) {
            xLimit = mapSize
        }
        if (this.dimensions.y > mapSize * TILE_SIZE) {
            yLimit = mapSize
        }

        if (debug.freeCamera || !here().size) {
            xLimit = Number.MAX_SAFE_INTEGER
            yLimit = Number.MAX_SAFE_INTEGER
        }

        const trackedPoint = this.dudeTarget?.standingPosition.plusY(-10) ?? this.pointTarget
        const clampedTrackedPoint = new Point(
            Maths.clamp(trackedPoint.x, -xLimit, xLimit),
            Maths.clamp(trackedPoint.y, -yLimit, yLimit)
        )

        const focalPoint = (() => {
            switch (this.focalPoint) {
                // currently unused. this API might end up changing
                case "top":
                    return new Point(this.dimensions.x / 2, this.dimensions.y / 3)
                default:
                    return this.dimensions.div(2)
            }
        })()

        return focalPoint.minus(clampedTrackedPoint)
    }
}
