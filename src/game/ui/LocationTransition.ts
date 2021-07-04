import { Component } from "../../engine/Component"
import { UpdateData } from "../../engine/Engine"
import { Point } from "../../engine/Point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Animator } from "../../engine/util/Animator"
import { Player } from "../characters/Player"
import { Camera } from "../cutscenes/Camera"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

const makeCircle = (context: CanvasRenderingContext2D, radius: number, centerPos: Point) => {
    if (radius === 0) {
        return
    }

    const relativeCenter = new Point(radius, radius).minus(new Point(.5, .5))
    const absoluteTopLeft = centerPos.plusX(-radius).plusY(-radius)
    const diameter = 2 * radius

    for (let x = 0; x < diameter; x++) {
        // Go down in y coords until we find the top circle radius.
        // From there, clear a rect (essentially drawing vertical strips).
        for (let y = 0; y < radius; y++) {
            if (relativeCenter.distanceTo(new Point(x, y)) < radius) {
                context.clearRect(
                    absoluteTopLeft.x + x,
                    absoluteTopLeft.y + y,
                    1,
                    (radius - y) * 2
                )
                break
            }
        }
    }
}

const FRAMES = 60
const TRANSITION_SPEED = 1500

/**
 * Animation that plays when going through a doorway
 */
export class LocationTransition extends Component {

    private animator: Animator
    private render: ImageRender
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D

    constructor() {
        super()
        this.canvas = document.createElement("canvas")
        this.context = this.canvas.getContext("2d", { alpha: true })
    }

    /**
     * @param callback is called on the frame where the screen is completely blacked out
     */
    transition(callback: () => void, pauseMillis: number = 360, openOnly = false) {
        // make sure it extends to the edge of the screen
        const dims = Camera.instance.dimensions.plusX(1).plusY(1)
        this.canvas.width = dims.x
        this.canvas.height = dims.y

        const maxRadius = dims.magnitude()

        // circles big->small->big
        const radiuses = []
        for (let i = 0; i < FRAMES; i++) {
            const radius = Math.floor(maxRadius/FRAMES * i)
            radiuses.push(radius)
            if (radiuses.length > 1 && !openOnly) {
                radiuses.unshift(radius)
            }
        }

        const getRender = (frame: number) => {
            const circleCenter = Player.instance.dude.standingPosition.plusY(-12)
                .minus(Camera.instance.position)
                .apply(Math.floor)
                
            const radius = radiuses[frame]
            
            this.context.fillStyle = Color.BLACK
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

            makeCircle(this.context, radius, circleCenter)

            return new ImageRender(
                this.canvas,
                Point.ZERO,
                dims,
                Point.ZERO,
                dims,
                UIStateManager.UI_SPRITE_DEPTH + 10_000
            )
        }

        this.render = getRender(0)

        const transitionFrame = openOnly ? 0 : FRAMES-1
        const blackScreenSpeed = pauseMillis
        const speed = TRANSITION_SPEED/(2*FRAMES-1)

        this.animator = new Animator(
            Array.from({length: radiuses.length}, (v, k) => k === transitionFrame ? blackScreenSpeed : speed),
            (frame) => {
                if (!!this.animator && frame !== 0) {
                    this.render = getRender(frame)
                }
                if (frame === transitionFrame) {
                    callback()
                }
            },
            () => {
                this.animator.paused = true
                this.animator = null
                this.render = null
            }
        )
    }

    update(updateData: UpdateData) {
        this.animator?.update(updateData.elapsedTimeMillis)
    }

    getRenderMethods() {
        return [this.render]
    }    
}