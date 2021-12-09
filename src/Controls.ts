import {
    ButtonState,
    CapturedGamepad,
    CapturedInput,
    GamepadButton,
    InputKey,
    MouseButton,
} from "brigsby/dist/Input"

const AXIS_DEAD_ZONE = 0.2

// The last gamepad which accepted input. Undefined if the user is using kb/m.
let currentGamepad: CapturedGamepad | undefined

type InputHandlers = {
    kbm?: (input: CapturedInput) => boolean
    gamepad?: (input: CapturedGamepad) => boolean
}

const check = (input: CapturedInput, handlers: InputHandlers) => {
    if (handlers.kbm && handlers.kbm(input)) {
        currentGamepad = undefined
        return true
    } else if (handlers.gamepad) {
        currentGamepad = input.gamepads.find((gp) => gp)
        return currentGamepad && handlers.gamepad(currentGamepad)
    }
    return false
}

/**
 * TODO:
 *   - Encapsulate all input here to support controllers easily
 *   - Add UI hints for both mouse/keyboard and gamepad
 *   - Add vibration hook here
 */
export const Controls = {
    isMenuClickDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isMouseDown,
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        }),

    isInteractDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(Controls.interactButton),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.SQUARE),
        }),

    isInteractSecondaryDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(Controls.interactButtonSecondary),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        }),

    isCloseButtonDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(InputKey.ESC),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.CIRCLE),
        }),

    isInventoryButtonDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(Controls.inventoryButton),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.TRIANGLE),
        }),

    isWalkUpHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyHeld(Controls.walkUp),
            gamepad: (pad) => pad.getLeftAxes().y < -AXIS_DEAD_ZONE,
        }),

    isWalkDownHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyHeld(Controls.walkDown),
            gamepad: (pad) => pad.getLeftAxes().y > AXIS_DEAD_ZONE,
        }),

    isWalkLeftHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyHeld(Controls.walkLeft),
            gamepad: (pad) => pad.getLeftAxes().x < -AXIS_DEAD_ZONE,
        }),

    isWalkRightHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyHeld(Controls.walkRight),
            gamepad: (pad) => pad.getLeftAxes().x > AXIS_DEAD_ZONE,
        }),

    isBlockHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isRightMouseHeld || input.isKeyHeld(InputKey.CONTROL),
            gamepad: (pad) => pad.isButtonHeld(GamepadButton.L2),
        }),

    isRollDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(InputKey.SHIFT),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        }),

    isJumpDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(InputKey.SPACE),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        }),

    isMapKeyHeld: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyHeld(InputKey.M),
            gamepad: (pad) => pad.isButtonHeld(GamepadButton.LEFT),
        }),

    isSheathKeyDown: (input: CapturedInput) =>
        check(input, {
            kbm: () => input.isKeyDown(InputKey.F),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.DOWN),
        }),

    isAttack: (state: ButtonState, input: CapturedInput) =>
        check(input, {
            kbm: () => input.isMouse(MouseButton.LEFT, state),
            gamepad: (pad) => pad.isButton(GamepadButton.R2, state),
        }),

    // TODO these are still used for UI — need to move that logic here as well
    walkUp: InputKey.W,
    walkDown: InputKey.S,
    walkLeft: InputKey.A,
    walkRight: InputKey.D,
    inventoryButton: InputKey.TAB,
    interactButton: InputKey.E,
    interactButtonSecondary: InputKey.F,

    // special case, we don't care about this on controllers (at least for now)
    pcModifierKey: InputKey.SHIFT,
}
