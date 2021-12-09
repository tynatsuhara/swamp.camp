import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
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
// let gamepadMousePos: Point | undefined  // TODO
let input: CapturedInput

type InputHandlers = {
    kbm?: (input: CapturedInput) => boolean
    gamepad?: (input: CapturedGamepad) => boolean
}

const check = (handlers: InputHandlers) => {
    if (!input) {
        console.error(
            "Input is being checked before it is initialized. Make sure the controls singleton is updated before anything else."
        )
        return false
    }
    if (handlers.kbm && handlers.kbm(input)) {
        currentGamepad = undefined
        // gamepadMousePos = undefined
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
 *   - Make this a component to simplify the API for other components
 */
class ControlsWrapper extends Component {
    update(updateData: UpdateData) {
        input = updateData.input
    }

    isMenuClickDown = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        })

    isInteractDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.interactButton),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.SQUARE),
        })

    isInteractSecondaryDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.interactButtonSecondary),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        })

    isCloseButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.ESC),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.CIRCLE),
        })

    isInventoryButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.inventoryButton),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.TRIANGLE),
        })

    isWalkUpHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkUp),
            gamepad: (pad) => pad.getLeftAxes().y < -AXIS_DEAD_ZONE,
        })

    isWalkDownHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkDown),
            gamepad: (pad) => pad.getLeftAxes().y > AXIS_DEAD_ZONE,
        })

    isWalkLeftHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkLeft),
            gamepad: (pad) => pad.getLeftAxes().x < -AXIS_DEAD_ZONE,
        })

    isWalkRightHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkRight),
            gamepad: (pad) => pad.getLeftAxes().x > AXIS_DEAD_ZONE,
        })

    isBlockHeld = () =>
        check({
            kbm: () => input.isRightMouseHeld || input.isKeyHeld(InputKey.CONTROL),
            gamepad: (pad) => pad.isButtonHeld(GamepadButton.L2),
        })

    isRollDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SHIFT),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        })

    isJumpDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SPACE),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.X),
        })

    isMapKeyHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.M),
            gamepad: (pad) => pad.isButtonHeld(GamepadButton.LEFT),
        })

    isSheathKeyDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.F),
            gamepad: (pad) => pad.isButtonDown(GamepadButton.DOWN),
        })

    isAttack = (state: ButtonState) =>
        check({
            kbm: () => input.isMouse(MouseButton.LEFT, state),
            gamepad: (pad) => pad.isButton(GamepadButton.R2, state),
        })

    // TODO: Support virtual mouse for gamepads

    getMousePos = () => {
        return input.mousePos
    }

    isMouseUp = () => {
        return input.isMouseUp
    }

    isMouseDown = () => {
        return input.isMouseDown
    }

    getScrollDeltaY = () => {
        return input.mouseWheelDeltaY
    }
}

/**
 * This is a special type of singleton that should never be destroyed.
 * It should always be updated in the component lifecycle before any
 * components which need to check for user input.
 */
export const controls = new Entity().addComponent(new ControlsWrapper())

export const Controls = {
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
