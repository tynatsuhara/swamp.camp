import {
    ButtonState,
    CapturedInput,
    GamepadButton,
    InputKey,
    MouseButton,
} from "brigsby/dist/Input"

const getController = (input: CapturedInput) => input.gamepads.find((gp) => gp)
const AXIS_DEAD_ZONE = 0.2

/**
 * TODO:
 *   - Encapsulate all input here to support controllers easily
 *   - Add UI hints for both mouse/keyboard and gamepad
 */
export const Controls = {
    isInteractDown: (input: CapturedInput) =>
        input.isKeyDown(Controls.interactButton) ||
        getController(input)?.isButtonDown(GamepadButton.SQUARE),

    isInteractSecondaryDown: (input: CapturedInput) =>
        input.isKeyDown(Controls.interactButtonSecondary) ||
        getController(input)?.isButtonDown(GamepadButton.X),

    isCloseButtonDown: (input: CapturedInput) =>
        input.isKeyDown(InputKey.ESC) || getController(input)?.isButtonDown(GamepadButton.CIRCLE),

    isInventoryButtonDown: (input: CapturedInput) =>
        input.isKeyDown(Controls.inventoryButton) ||
        getController(input)?.isButtonDown(GamepadButton.TRIANGLE),

    isWalkUpHeld: (input: CapturedInput) =>
        input.isKeyHeld(Controls.walkUp) || getController(input)?.getLeftAxes().y < -AXIS_DEAD_ZONE,
    isWalkDownHeld: (input: CapturedInput) =>
        input.isKeyHeld(Controls.walkDown) ||
        getController(input)?.getLeftAxes().y > AXIS_DEAD_ZONE,
    isWalkLeftHeld: (input: CapturedInput) =>
        input.isKeyHeld(Controls.walkLeft) ||
        getController(input)?.getLeftAxes().x < -AXIS_DEAD_ZONE,
    isWalkRightHeld: (input: CapturedInput) =>
        input.isKeyHeld(Controls.walkRight) ||
        getController(input)?.getLeftAxes().x > AXIS_DEAD_ZONE,

    isBlockHeld: (input: CapturedInput) =>
        input.isRightMouseHeld ||
        input.isKeyHeld(InputKey.CONTROL) ||
        getController(input)?.isButtonHeld(GamepadButton.L2),

    isRollDown: (input: CapturedInput) =>
        input.isKeyDown(InputKey.SHIFT) || getController(input)?.isButtonDown(GamepadButton.R1),

    isJumpDown: (input: CapturedInput) =>
        input.isKeyDown(InputKey.SPACE) || getController(input)?.isButtonDown(GamepadButton.X),

    isMapKeyHeld: (input: CapturedInput) =>
        input.isKeyHeld(InputKey.M) || getController(input)?.isButtonHeld(GamepadButton.DOWN),

    isSheathKeyDown: (input: CapturedInput) =>
        input.isKeyDown(InputKey.F) || getController(input)?.isButtonDown(GamepadButton.RIGHT),

    isAttack: (state: ButtonState, input: CapturedInput) =>
        input.isMouse(MouseButton.LEFT, state) ||
        getController(input)?.isButton(GamepadButton.R2, state),

    // TODO these are still used for UI — need to move that logic here as well
    walkUp: InputKey.W,
    walkDown: InputKey.S,
    walkLeft: InputKey.A,
    walkRight: InputKey.D,
    inventoryButton: InputKey.TAB,

    // TODO move checking logic here
    interactButton: InputKey.E,
    interactButtonSecondary: InputKey.F,

    pcModifierKey: InputKey.SHIFT,
}
