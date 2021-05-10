import { InputKey } from "../engine/Input"

export const Controls = {
    interactButton: InputKey.E,
    interactButtonSecondary: InputKey.F,
    closeButton: InputKey.ESC,
    inventoryButton: InputKey.I,
    walkUp: InputKey.W,
    walkDown: InputKey.S,
    walkLeft: InputKey.A,
    walkRight: InputKey.D,
    blockKey: InputKey.SHIFT,

    keyString: (inputKey: InputKey) => {
        return String.fromCharCode(inputKey)
    }
}