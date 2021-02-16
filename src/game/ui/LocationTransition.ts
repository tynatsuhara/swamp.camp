import { Component } from "../../engine/component"
import { UpdateData } from "../../engine/engine"
import { Point } from "../../engine/point"
import { ImageRender } from "../../engine/renderer/ImageRender"
import { Animator } from "../../engine/util/Animator"
import { Camera } from "../cutscenes/Camera"
import { Color } from "./Color"
import { UIStateManager } from "./UIStateManager"

const makeCircle = (context: CanvasRenderingContext2D, dims: Point, radius: number) => {
    if (radius === 0) {
        return
    }

    const center = new Point(radius, radius).minus(new Point(.5, .5))
    const imageDataOffset = dims.div(2).plusX(-radius).plusY(-radius)
    const diameter = 2 * radius
    const imageData = context.getImageData(imageDataOffset.x, imageDataOffset.y, diameter, diameter)

    for (let x = 0; x < diameter; x++) {
        for (let y = 0; y < diameter; y++) {
            const i = (x + y * diameter) * 4
            const pt = new Point(x, y)
            if (center.distanceTo(pt) < diameter/2) {
                imageData.data[i+3] = 0
            }
        }
    }

    context.putImageData(imageData, imageDataOffset.x, imageDataOffset.y)
}

const FRAMES = 12
const SPEED = 30

export class LocationTransition extends Component {

    private animator: Animator
    private render: ImageRender

    transition(callback: () => void) {
        const dims = Camera.instance.dimensions.plusX(1).plusY(1)
        const maxRadius = dims.div(2).magnitude()

        // circles big->small->big
        const renders = []

        for (let i = 0; i < FRAMES; i++) {
            const radius = Math.floor(maxRadius/FRAMES * i)
            const canvas = document.createElement("canvas")
            canvas.width = dims.x
            canvas.height = dims.y

            const context = canvas.getContext("2d", { alpha: true })
            context.fillStyle = Color.BLACK
            context.fillRect(0, 0, canvas.width, canvas.height)

            makeCircle(context, dims, radius)

            const render = new ImageRender(
                canvas,
                Point.ZERO,
                dims,
                Point.ZERO,
                dims,
                UIStateManager.UI_SPRITE_DEPTH + 10_000
            )

            renders.push(render)
            if (renders.length > 1) {
                renders.unshift(render)
            }
        }

        const transitionFrame = FRAMES-1
        const blackScreenSpeed = 10 * SPEED

        this.animator = new Animator(
            Array.from({length: FRAMES * 2 - 1}, (v, k) => k === transitionFrame ? blackScreenSpeed : SPEED),
            (frame) => {
                if (!!this.animator) {
                    this.render = renders[frame]
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