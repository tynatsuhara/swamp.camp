export const enum InputKey {
    E = 69,
    W = 87,
    A = 65,
    S = 83,
    D = 68,
    SHIFT = 16
}

export class Input {
    lastCapture: CapturedInput
    keys: Set<number> = new Set()

    constructor() {
        window.onkeydown = e => this.keys.add(e.keyCode)
        window.onkeyup = e => this.keys.delete(e.keyCode)
    }

    captureInput(): CapturedInput {
        const keys = Array.from(this.keys)
        this.lastCapture = new CapturedInput(
            new Set(keys.filter(key => !this.lastCapture.isKeyHeld(key))),
            new Set(keys.slice())
        ) 
        return this.lastCapture
    }
}

export class CapturedInput {
    private readonly down: Set<number>
    private readonly held: Set<number>

    constructor(down: Set<number>, held: Set<number>) {
        this.down = down
        this.held = held
    }

    isKeyDown(key: InputKey): boolean {
        return this.down.has(key)
    }

    isKeyHeld(key: InputKey): boolean {
        return this.held.has(key)
    }
}