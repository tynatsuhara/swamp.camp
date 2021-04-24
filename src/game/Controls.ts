import { InputKey } from "../engine/input"

export const Controls = {
    interactButton: InputKey.E,
    interactButtonSecondary: InputKey.F,
    closeButton: InputKey.ESC,
    inventoryButton: InputKey.I,
    walkUp: InputKey.W,
    walkDown: InputKey.S,
    walkLeft: InputKey.A,
    walkRight: InputKey.D,
    attackKey: InputKey.K,
    blockKey: InputKey.L,

    keyString: (inputKey: InputKey) => {
        return String.fromCharCode(inputKey)
    }
}