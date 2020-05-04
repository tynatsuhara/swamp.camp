import { InputKey, CapturedInput } from "../engine/input"

export const Controls = {
    interact: (ci: CapturedInput) => ci.isKeyDown(InputKey.E)
}