import { Point } from "./point"
import { View } from "./View"

// TODO: Consider switching to using event.code string instead of keycode
export const enum InputKey {
    ZERO = 48, ONE = 49, TWO = 50, THREE = 51, FOUR = 52, FIVE = 53, SIX = 54, SEVEN = 55, EIGHT = 56, NINE = 57,
    Q = 81, W = 87, E = 69, R = 82, T = 82, Y = 89, U = 85, I = 73, O = 79, P = 80,
    A = 65, S = 83, D = 68, F = 70, G = 71, H = 72, J = 74, K = 75, L = 76,
    Z = 90, X = 88, C = 67, V = 86, B = 66, N = 78, M = 77,
    SHIFT = 16, SPACE = 32
}

export class Input {
    private readonly canvas: HTMLCanvasElement
    private readonly keys: Set<number> = new Set()
    private lastCapture: CapturedInput = new CapturedInput()
    private mousePos: Point = new Point(0, 0)
    private isMouseDown: boolean = false
    private isMouseHeld: boolean = false
    private isMouseUp: boolean = false 
    private isRightMouseDown: boolean = false
    private isRightMouseHeld: boolean = false
    private isRightMouseUp: boolean = false 

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        canvas.oncontextmenu = () => false

        canvas.onmousedown = (e) => { 
            if (e.button === 0) {
                this.isMouseDown = true 
                this.isMouseHeld = true
                this.isMouseUp = false
            } else if (e.button == 2) {
                this.isRightMouseDown = true 
                this.isRightMouseHeld = true
                this.isRightMouseUp = false
            }
        }
        canvas.onmouseup = (e) => { 
            if (e.button === 0) {
                this.isMouseDown = false
                this.isMouseHeld = false
                this.isMouseUp = true 
            } else if (e.button === 1) {
                this.isRightMouseDown = false 
                this.isRightMouseHeld = false
                this.isRightMouseUp = true
            }
        }        
        canvas.onmousemove = (e) => {
            this.mousePos = new Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop)
        }
        window.onkeydown = e => this.keys.add(e.keyCode)
        window.onkeyup = e => this.keys.delete(e.keyCode)
    }

    captureInput(): CapturedInput {
        const keys = Array.from(this.keys)
        this.lastCapture = new CapturedInput(
            new Set(keys.filter(key => !this.lastCapture.isKeyHeld(key))),
            new Set(keys.slice()),
            new Set(this.lastCapture.getKeysHeld().filter(key => !this.keys.has(key))),
            this.mousePos,
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp
        )

        // reset since these should only be true for 1 tick
        this.isMouseDown = false
        this.isMouseUp = false
        this.isRightMouseDown = false
        this.isRightMouseUp = false

        return this.lastCapture
    }
}

// TODO: Capture mouse input for clickable elements
export class CapturedInput {
    private readonly keysDown: Set<number>
    private readonly keysHeld: Set<number>
    private readonly keysUp: Set<number>
    readonly mousePos: Point = new Point(0, 0)
    readonly isMouseDown: boolean = false
    readonly isMouseHeld: boolean = false
    readonly isMouseUp: boolean = false
    readonly isRightMouseDown: boolean = false
    readonly isRightMouseHeld: boolean = false
    readonly isRightMouseUp: boolean = false 

    constructor(
        keysDown: Set<number> = new Set(), 
        keysHeld: Set<number> = new Set(),
        keysUp: Set<number> = new Set(),
        mousePos: Point = new Point(0, 0),
        isMouseDown: boolean = false,
        isMouseHeld: boolean = false,
        isMouseUp: boolean = false,
        isRightMouseDown: boolean = false,
        isRightMouseHeld: boolean = false,
        isRightMouseUp: boolean = false 
    ) {
        this.keysDown = keysDown
        this.keysHeld = keysHeld
        this.keysUp = keysUp
        this.mousePos = mousePos
        this.isMouseDown = isMouseDown
        this.isMouseHeld = isMouseHeld
        this.isMouseUp = isMouseUp
        this.isRightMouseDown = isRightMouseDown
        this.isRightMouseHeld = isRightMouseHeld
        this.isRightMouseUp = isRightMouseUp
    }

    scaledForView(view: View): CapturedInput {
        return new CapturedInput(
            this.keysDown,
            this.keysHeld,
            this.keysUp,
            this.mousePos.div(view.zoom).minus(view.offset),
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp,
            this.isRightMouseDown,
            this.isRightMouseHeld,
            this.isRightMouseUp
        )
    }

    getKeysHeld(): number[] {
        return Array.from(this.keysUp)
    }

    isKeyDown(key: InputKey): boolean {
        return this.keysDown.has(key)
    }

    isKeyHeld(key: InputKey): boolean {
        return this.keysHeld.has(key)
    }

    isKeyUp(key: InputKey): boolean {
        return this.keysUp.has(key)
    }
}