import { Component, Entity, Point } from "brigsby/dist"
import { BasicRenderComponent, ImageRender } from "brigsby/dist/renderer"
import { UIStateManager } from "./UIStateManager"

const WIDTH = 20
const HEIGHT = 20

export class DrawMenu extends Component {
    static instance: DrawMenu

    constructor() {
        super()
        DrawMenu.instance = this
    }

    get isOpen() {
        return this.showingDrawMenu
    }

    private readonly e = new Entity([this]) // entity for this Component
    private showingDrawMenu = false
    private canvas: HTMLCanvasElement

    open() {
        if (this.showingDrawMenu) {
            return
        }
        console.log("open")
        this.showingDrawMenu = true

        this.canvas = document.createElement("canvas")
        this.canvas.width = WIDTH
        this.canvas.height = HEIGHT

        const context = this.canvas.getContext("2d")
        context.fillStyle = "green"
        context.fillRect(0, 0, WIDTH, HEIGHT)
    }

    close() {
        console.log("close")
        this.showingDrawMenu = false
        this.canvas = null
    }

    getEntities(): Entity[] {
        return [
            this.e,
            this.canvas &&
                new Entity([
                    new BasicRenderComponent(
                        new ImageRender(
                            this.canvas,
                            Point.ZERO,
                            new Point(WIDTH, HEIGHT),
                            new Point(50, 50),
                            new Point(WIDTH, HEIGHT),
                            UIStateManager.UI_SPRITE_DEPTH
                        )
                    ),
                ]),
        ]
    }
}
