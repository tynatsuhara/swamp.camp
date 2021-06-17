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

const FRAMES = 12
const SPEED = 30

/**
 * Animation that plays when going through a doorway
 */
export class LocationTransition extends Component {

    private animator: Animator
    private render: ImageRender

    transition(callback: () => void, pauseMillis: number = 12 * SPEED, openOnly = false) {
        const centerPos = Player.instance.dude.standingPosition.plusY(-12)
                .minus(Camera.instance.position)
                .apply(Math.floor)

        const dims = Camera.instance.dimensions.plusX(1).plusY(1)
        // The radius should extend to the edge of the screen even if the player is near the edge of the map
        const maxRadius = Math.max(centerPos.x, Camera.instance.dimensions.x - centerPos.x)

        // circles big->small->big
        const radiuses = []
        for (let i = 0; i < FRAMES; i++) {
            const radius = Math.floor(maxRadius/FRAMES * i)
            radiuses.push(radius)
            if (radiuses.length > 1 && !openOnly) {
                radiuses.unshift(radius)
            }
        }

        const canvas = document.createElement("canvas")
        canvas.width = dims.x
        canvas.height = dims.y
        const context = canvas.getContext("2d", { alpha: true })

        const getRender = (frame: number) => {
            const radius = radiuses[frame]
            
            context.fillStyle = Color.BLACK
            context.fillRect(0, 0, canvas.width, canvas.height)

            makeCircle(context, radius, centerPos)

            return new ImageRender(
                canvas,
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

        this.animator = new Animator(
            Array.from({length: radiuses.length}, (v, k) => k === transitionFrame ? blackScreenSpeed : SPEED),
            (frame) => {
                if (!!this.animator) {
                    this.render = getRender(frame)
                }
                if (frame === transitionFrame) {
                    callback()
                }
            },
            () => {
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