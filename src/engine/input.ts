import { Point } from "./point";

export const enum InputKey {
    E = 69,
    W = 87,
    A = 65,
    S = 83,
    D = 68,
    SHIFT = 16
}

export class Input {
    private readonly canvas: HTMLCanvasElement
    private readonly keys: Set<number> = new Set()
    private lastCapture: CapturedInput = new CapturedInput()
    private mousePos: Point = new Point(0, 0)
    private isMouseDown: boolean = false
    private isMouseHeld: boolean = false
    private isMouseUp: boolean = false 

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        canvas.onmousedown = (e) => { 
            this.isMouseDown = true 
            this.isMouseHeld = true
            this.isMouseUp = false
        }
        canvas.onmouseup = (e) => { 
            this.isMouseDown = false
            this.isMouseHeld = false
            this.isMouseUp = true 
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

    constructor(
        keysDown: Set<number> = new Set(), 
        keysHeld: Set<number> = new Set(),
        keysUp: Set<number> = new Set(),
        mousePos: Point = new Point(0, 0),
        isMouseDown: boolean = false,
        isMouseHeld: boolean = false,
        isMouseUp: boolean = false
    ) {
        this.keysDown = keysDown
        this.keysHeld = keysHeld
        this.keysUp = keysUp
        this.mousePos = mousePos
        this.isMouseDown = isMouseDown
        this.isMouseHeld = isMouseHeld
        this.isMouseUp = isMouseUp
    }

    scaled(zoom: number): CapturedInput {
        return new CapturedInput(
            this.keysDown,
            this.keysHeld,
            this.keysUp,
            this.mousePos.div(zoom),
            this.isMouseDown,
            this.isMouseHeld,
            this.isMouseUp
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