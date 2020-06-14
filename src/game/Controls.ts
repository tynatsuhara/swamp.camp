import { InputKey, CapturedInput } from "../engine/input"

export const Controls = {
    interactButton: InputKey.E,
    closeButton: InputKey.ESC,
    inventoryButton: InputKey.I,

    keyString: (inputKey: InputKey) => {
        return String.fromCharCode(inputKey)
    }
}