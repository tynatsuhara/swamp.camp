import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Entity } from "brigsby/dist/Entity"
import {
    ButtonState,
    CapturedGamepad,
    CapturedInput,
    GamepadButton,
    GamepadVibrationOptions,
    InputKey,
    MouseButton,
} from "brigsby/dist/Input"
import { Point } from "brigsby/dist/Point"
import { Maths } from "brigsby/dist/util/Maths"
import { Dude } from "./characters/Dude"
import { Camera } from "./cutscenes/Camera"

// The last gamepad which accepted input. Undefined if the user is using kb/m.
let gamepad: CapturedGamepad | undefined
let gamepadMousePos: Point | undefined
let isGamepadMode = false

// NOTE: This view is scaled to the UI layer
let input: CapturedInput

type InputHandlers<T> = {
    /**
     * If this returns a truthy value, {@link isGamepadMode} will be false
     * and gamepad input will not be checked
     */
    kbm: () => T
    /**
     * If kbm returns a falsey value, and this returns a truthy value, {@link isGamepadMode}
     * will be true. This will only be executed if {@link gamepad} is defined
     */
    gamepad: () => T
}

const check = <T>(handlers: InputHandlers<T>) => {
    if (!input) {
        console.error(
            "Input is being checked before it is initialized. Make sure the controls singleton is updated before anything else."
        )
    }

    const kbmResult = handlers.kbm()
    if (kbmResult || !gamepad) {
        isGamepadMode = false
        gamepadMousePos = undefined
        return kbmResult
    }

    const gamepadResult = handlers.gamepad()
    if (gamepadResult) {
        isGamepadMode = true
        if (!gamepadMousePos) {
            gamepadMousePos = input.mousePos
        }
    }

    return gamepadResult
}

const AXIS_DEAD_ZONE = 0.2
const CURSOR_SENSITIVITY = 2

const deaden = (axes: Point) =>
    new Point(
        axes.x < AXIS_DEAD_ZONE && axes.x > -AXIS_DEAD_ZONE ? 0 : axes.x,
        axes.y < AXIS_DEAD_ZONE && axes.y > -AXIS_DEAD_ZONE ? 0 : axes.y
    )

/**
 * TODO:
 *   - Add UI hints for both mouse/keyboard and gamepad
 *   - Add vibration hook here
 *   - Make sure the APIs are consistently named
 */
class ControlsWrapper extends Component {
    update(updateData: UpdateData) {
        input = updateData.input

        gamepad = input.gamepads.find((gp) => gp)

        if (gamepad && !isGamepadMode) {
            if (
                deaden(gamepad.getLeftAxes()).magnitude() > 0 ||
                deaden(gamepad.getRightAxes()).magnitude() > 0
            ) {
                isGamepadMode = true
            }
        }

        if (isGamepadMode && input.mousePosDelta.magnitude() > 0) {
            isGamepadMode = false
            gamepadMousePos = undefined
        }

        // Adjust the virtual mouse position if they're using a gamepad
        if (isGamepadMode) {
            if (!gamepadMousePos) {
                gamepadMousePos = input.mousePos
            }
            const stickInput = deaden(gamepad.getRightAxes()).times(CURSOR_SENSITIVITY)
            const adjustedPos = gamepadMousePos.plus(stickInput)
            const bounds = Camera.instance.dimensions.minus(new Point(3, 3))
            gamepadMousePos = new Point(
                Maths.clamp(adjustedPos.x, 0, bounds.x),
                Maths.clamp(adjustedPos.y, 0, bounds.y)
            )
        }
    }

    isGamepadMode() {
        return isGamepadMode
    }

    isMenuClickDown = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: () => gamepad.isButtonDown(GamepadButton.X),
        })

    isInteractDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.interactButton),
            gamepad: () => gamepad.isButtonDown(GamepadButton.SQUARE),
        })

    // TODO figure out the best controller mapping for this
    isInteractSecondaryDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.interactButtonSecondary),
            gamepad: () => gamepad.isButtonDown(GamepadButton.X),
        })

    isCloseButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.ESC),
            gamepad: () => gamepad.isButtonDown(GamepadButton.CIRCLE),
        })

    isInventoryButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(Controls.inventoryButton),
            gamepad: () => gamepad.isButtonDown(GamepadButton.TRIANGLE),
        })

    // TODO: Make walk functions return [0, 1] to support analog sticks

    isWalkUpHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkUp),
            gamepad: () => gamepad.getLeftAxes().y < -AXIS_DEAD_ZONE,
        })

    isWalkDownHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkDown),
            gamepad: () => gamepad.getLeftAxes().y > AXIS_DEAD_ZONE,
        })

    isWalkLeftHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkLeft),
            gamepad: () => gamepad.getLeftAxes().x < -AXIS_DEAD_ZONE,
        })

    isWalkRightHeld = () =>
        check({
            kbm: () => input.isKeyHeld(Controls.walkRight),
            gamepad: () => gamepad.getLeftAxes().x > AXIS_DEAD_ZONE,
        })

    isBlockHeld = () =>
        check({
            kbm: () => input.isRightMouseHeld || input.isKeyHeld(InputKey.CONTROL),
            gamepad: () => gamepad.isButtonHeld(GamepadButton.L2),
        })

    isRollDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SHIFT),
            gamepad: () => gamepad.isButtonDown(GamepadButton.R1),
        })

    isJumpDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SPACE),
            gamepad: () => gamepad.isButtonDown(GamepadButton.X),
        })

    isMapKeyHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.M),
            gamepad: () => gamepad.isButtonHeld(GamepadButton.LEFT),
        })

    isSheathKeyDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.F),
            gamepad: () => gamepad.isButtonDown(GamepadButton.DOWN),
        })

    isAttack = (state: ButtonState) =>
        check({
            kbm: () => input.isMouse(MouseButton.LEFT, state),
            gamepad: () => gamepad.isButton(GamepadButton.R2, state),
        })

    isModifierHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.SHIFT),
            gamepad: () => gamepad.isButtonHeld(GamepadButton.L1),
        })

    getMousePos = () => {
        return isGamepadMode ? gamepadMousePos : input.mousePos
    }

    getWorldSpaceMousePos = () => {
        return this.translateToWorldSpace(this.getMousePos())
    }

    // TODO
    isMouseUp = () => {
        return input.isMouseUp
    }

    // TODO
    isMouseDown = () => {
        return input.isMouseDown
    }

    // TODO test this
    getScrollDeltaY = () => {
        return isGamepadMode ? gamepad.getRightAxes().y : input.mouseWheelDeltaY
    }

    getPlayerFacingDirection = (dude: Dude) => {
        if (isGamepadMode) {
            // TODO: remember the last non-zero input and use that instead
            const axis = gamepad.getRightAxes().x
            if (axis < -AXIS_DEAD_ZONE) {
                return -1
            } else if (axis > AXIS_DEAD_ZONE) {
                return 1
            }
            return 0
        } else {
            return this.translateToWorldSpace(input.mousePos).x - dude.standingPosition.x
        }
    }

    vibrate = (options: GamepadVibrationOptions) => gamepad?.vibrate(options)

    private translateToWorldSpace = (mousePos: Point) => mousePos.plus(Camera.instance.position)

    /**
     * DO NOT USE THIS METHOD — BECAUSE CONTROLS IS RENDERED IN THE FIRST VIEW,
     * ANY RENDER METHODS WILL ALWAYS BE OBSCURED BY THE SUBSEQUENT VIEWS
     */
    getRenderMethods = () => {
        return []
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
}
