export const enum InputKey {
    E = 69,
    W = 87,
    A = 65,
    S = 83,
    D = 68,
    SHIFT = 16
}

export class Input {
    lastCapture: CapturedInput = new CapturedInput()
    keys: Set<number> = new Set()

    constructor() {
        window.onkeydown = e => this.keys.add(e.keyCode)
        window.onkeyup = e => this.keys.delete(e.keyCode)
    }

    captureInput(): CapturedInput {
        const keys = Array.from(this.keys)
        this.lastCapture = new CapturedInput(
            new Set(keys.filter(key => !this.lastCapture.isKeyHeld(key))),
            new Set(keys.slice()),
            new Set(this.lastCapture.getKeysHeld().filter(key => !this.keys.has(key)))
        ) 
        return this.lastCapture
    }
}

// TODO: Capture mouse input for clickable elements
export class CapturedInput {
    private readonly down: Set<number>
    private readonly held: Set<number>
    private readonly up: Set<number>

    constructor(down: Set<number> = new Set(), held: Set<number> = new Set(), up: Set<number> = new Set()) {
        this.down = down
        this.held = held
        this.up = up
    }

    getKeysHeld(): number[] {
        return Array.from(this.held)
    }

    isKeyDown(key: InputKey): boolean {
        return this.down.has(key)
    }

    isKeyHeld(key: InputKey): boolean {
        return this.held.has(key)
    }

    isKeyUp(key: InputKey): boolean {
        return this.up.has(key)
    }
}