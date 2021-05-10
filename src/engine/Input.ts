import { Point } from "./Point"
import { View } from "./View"

// TODO: Consider switching to using event.code string instead of keycode
export const enum InputKey {
    ZERO = 48, ONE = 49, TWO = 50, THREE = 51, FOUR = 52, FIVE = 53, SIX = 54, SEVEN = 55, EIGHT = 56, NINE = 57,
    TAB = 9, Q = 81, W = 87, E = 69, R = 82, T = 84, Y = 89, U = 85, I = 73, O = 79, P = 80,
    A = 65, S = 83, D = 68, F = 70, G = 71, H = 72, J = 74, K = 75, L = 76, SEMICOLON = 186, QUOTE = 222,
    Z = 90, X = 88, C = 67, V = 86, B = 66, N = 78, M = 77, COMMA = 188, PERIOD = 190,
    SHIFT = 16, SPACE = 32, ESC = 27,
    UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39
}

const enum MouseButton {
    LEFT = 0,
    RIGHT = 2
}

export class Input {
    private readonly keys: Set<number> = new Set()
    private lastCapture: CapturedInput = new CapturedInput()
    private mousePos: Point = new Point(0, 0)
    private isMouseDown: boolean = false
    private isMouseHeld: boolean = false
    private isMouseUp: boolean = false 
    private isRightMouseDown: boolean = false
    private isRightMouseHeld: boolean = false
    private isRightMouseUp: boolean = false 
    private mouseWheelDeltaY: number = 0

    constructor(canvas: HTMLCanvasElement) {
        canvas.oncontextmenu = () => false

        canvas.onmousedown = (e) => { 
            if (e.button === MouseButton.LEFT) {
                this.isMouseDown = true 
                this.isMouseHeld = true
                this.isMouseUp = false
            } else if (e.button == MouseButton.RIGHT) {
                this.isRightMouseDown = true 
                this.isRightMouseHeld = true
                this.isRightMouseUp = false
            }
        }
        canvas.onmouseup = (e) => { 
            if (e.button === MouseButton.LEFT) {
                this.isMouseDown = false
                this.isMouseHeld = false
                this.isMouseUp = true 
            } else if (e.button === MouseButton.RIGHT) {
                this.isRightMouseDown = false 
                this.isRightMouseHeld = false
                this.isRightMouseUp = true
            }
        }        
        canvas.onmousemove = e => this.mousePos = new Point(e.x - canvas.offsetLeft, e.y - canvas.offsetTop)
        canvas.onwheel = e => this.mouseWheelDeltaY = e.deltaY
        window.onkeydown = e => this.keys.add(this.captureKey(e).keyCode)
        window.onkeyup = e => this.keys.delete(this.captureKey(e).keyCode)
    }

    captureInput(): CapturedInput {
        console.log()

        const keys = Array.from(this.keys)
        this.lastCapture = new CapturedInput(
            new Set(keys.filter(key => !this.lastCapture.isKeyHeld(key))),
            new Set(keys.slice()),
            new Set(this.lastCapture.getKeysHeld().filter(key => !this.keys.has(key))),
            this.mousePos,
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp,
            this.isRightMouseDown,
            this.isRightMouseHeld,
            this.isRightMouseUp,
            this.mouseWheelDeltaY,
        )

        // reset since these should only be true for 1 tick
        this.isMouseDown = false
        this.isMouseUp = false
        this.isRightMouseDown = false
        this.isRightMouseUp = false
        this.mouseWheelDeltaY = 0

        return this.lastCapture
    }

    private captureKey(e: any) {
        // TODO: Make this keyset configurable
        if (e.keyCode === InputKey.TAB) {
            e.preventDefault()
        }
        return e
    }
}

export class CapturedInput {
    private readonly keysDown: Set<number>
    private readonly keysHeld: Set<number>
    private readonly keysUp: Set<number>
    readonly mousePos: Point = new Point(0, 0)
    readonly isMouseDown: boolean
    readonly isMouseHeld: boolean
    readonly isMouseUp: boolean
    readonly isRightMouseDown: boolean
    readonly isRightMouseHeld: boolean
    readonly isRightMouseUp: boolean
    readonly mouseWheelDeltaY: number

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
        isRightMouseUp: boolean = false,
        mouseWheelDeltaY: number = 0,
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
        this.mouseWheelDeltaY = mouseWheelDeltaY
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
            this.isRightMouseUp,
            this.mouseWheelDeltaY
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