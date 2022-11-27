import {
    ButtonState,
    CapturedGamepad,
    CapturedInput,
    Component,
    Entity,
    GamepadButton,
    GamepadVibrationOptions,
    InputKey,
    MouseButton,
    Point,
    UpdateData,
} from "brigsby/dist"
import { Maths } from "brigsby/dist/util"
import { Dude } from "./characters/Dude"
import { Camera } from "./cutscenes/Camera"
import { FullScreenMode } from "./ui/FullScreenMode"
import { TextIcon } from "./ui/Text"

// The last gamepad which accepted input. Undefined if the user is using kb/m.
let gamepadInput: CapturedGamepad | undefined
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
     * will be true. This will only be executed if {@link gamepadInput} is defined
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
    if (kbmResult || !gamepadInput) {
        isGamepadMode = false
        gamepadMousePos = undefined
        return kbmResult
    }

    const gamepadResult = handlers.gamepad()
    if (gamepadResult) {
        isGamepadMode = true
    }

    return gamepadResult
}

const AXIS_DEAD_ZONE = 0.2
const CURSOR_SENSITIVITY = 2.5

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
    readonly HOT_KEY_OPTIONS = [
        InputKey.ZERO,
        InputKey.ONE,
        InputKey.TWO,
        InputKey.THREE,
        InputKey.FOUR,
        InputKey.FIVE,
        InputKey.SIX,
        InputKey.SEVEN,
        InputKey.EIGHT,
        InputKey.NINE,
    ]

    update(updateData: UpdateData) {
        input = updateData.input

        gamepadInput = input.gamepads.find((gp) => gp)

        if (!gamepadInput || (isGamepadMode && input.mousePosDelta.magnitude() > 0)) {
            isGamepadMode = false
            gamepadMousePos = undefined
            return
        }

        if (gamepadInput && !isGamepadMode) {
            const leftStick = deaden(gamepadInput.getLeftAxes())
            const rightStick = deaden(gamepadInput.getRightAxes())

            if (leftStick.magnitude() > 0 || rightStick.magnitude() > 0) {
                isGamepadMode = true
            }
        }

        // toggle fullscreen gamepad shortcut
        if (isGamepadMode && gamepadInput.isButton(GamepadButton.SELECT, ButtonState.DOWN)) {
            if (FullScreenMode.isFullScreen()) {
                FullScreenMode.exit()
            } else {
                FullScreenMode.enter()
            }
        }
    }

    updateGamepadCursorPosition() {
        if (!isGamepadMode || !gamepadInput) {
            return
        }

        const currentGamePadMousePos = this.getMousePos()

        // Both left and right stick can be used for mouse
        const leftStick = deaden(gamepadInput.getLeftAxes())
        const rightStick = deaden(gamepadInput.getRightAxes())
        const stickInput = leftStick.plus(rightStick).times(CURSOR_SENSITIVITY)

        const adjustedPos = currentGamePadMousePos.plus(stickInput)
        const bounds = Camera.instance.dimensions.minus(new Point(3, 3))
        gamepadMousePos = new Point(
            Maths.clamp(adjustedPos.x, 0, bounds.x),
            Maths.clamp(adjustedPos.y, 0, bounds.y)
        )
    }

    isGamepadMode() {
        return isGamepadMode
    }

    // ======== INVENTORY STUFF ========

    isInventoryButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.Q),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.UP),
        })

    getInventoryButtonString = () => (isGamepadMode ? TextIcon.GAMEPAD_UP : "[q]")

    isInventoryOptionOneDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.E),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.SQUARE),
        })

    getInventoryOptionOneString = () => (isGamepadMode ? TextIcon.GAMEPAD_SQUARE : "[e]")

    isInventoryOptionTwoDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.F),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.TRIANGLE),
        })

    getInventoryOptionTwoString = () => (isGamepadMode ? TextIcon.GAMEPAD_TRIANGLE : "[f]")

    // TODO maybe revisit these controls on gamepad

    isInventoryStackPickUp = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.X),
        })

    isInventoryStackDrop = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.X),
        })

    isInventoryStackPickUpHalf = () =>
        check({
            kbm: () => input.isRightMouseDown,
            gamepad: () =>
                gamepadInput.isButtonHeld(GamepadButton.L1) &&
                gamepadInput.isButtonDown(GamepadButton.X),
        })

    isInventoryStackDropOne = () =>
        check({
            kbm: () => input.isRightMouseDown,
            gamepad: () =>
                gamepadInput.isButtonHeld(GamepadButton.L1) &&
                gamepadInput.isButtonDown(GamepadButton.X),
        })

    // ======== OTHER MENU STUFF ========

    isCloseMenuButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.TAB),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.CIRCLE),
        })

    isOpenPauseMenuButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.TAB),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.START),
        })

    isTabRightDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.D),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.R1),
        })

    isTabLeftDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.A),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.L1),
        })

    isMenuClickDown = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.X),
        })

    // ======== PLAYER CONTROLS ========
    // TODO: Make walk functions return [0, 1] to support analog sticks

    isInteractDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.E),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.X),
        })

    getInteractButtonString = () => (isGamepadMode ? TextIcon.GAMEPAD_SQUARE : "[e]")

    isWalkUpHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.W),
            gamepad: () => gamepadInput.getLeftAxes().y < -AXIS_DEAD_ZONE,
        })

    isWalkDownHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.S),
            gamepad: () => gamepadInput.getLeftAxes().y > AXIS_DEAD_ZONE,
        })

    isWalkLeftHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.A),
            gamepad: () => gamepadInput.getLeftAxes().x < -AXIS_DEAD_ZONE,
        })

    isWalkRightHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.D),
            gamepad: () => gamepadInput.getLeftAxes().x > AXIS_DEAD_ZONE,
        })

    isBlockHeld = () =>
        check({
            kbm: () => input.isRightMouseHeld || input.isKeyHeld(InputKey.CONTROL),
            gamepad: () =>
                gamepadInput.isButtonHeld(GamepadButton.L1) ||
                gamepadInput.isButtonHeld(GamepadButton.L2),
        })

    isRollDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SHIFT),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.CIRCLE),
        })

    isJumpDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SPACE),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.SQUARE),
        })

    isMapKeyHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.M),
            gamepad: () => gamepadInput.isButtonHeld(GamepadButton.RIGHT),
        })

    isSheathKeyDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.F),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.DOWN),
        })

    isAttack = (state: ButtonState) =>
        check({
            kbm: () => input.isMouse(MouseButton.LEFT, state),
            gamepad: () =>
                gamepadInput.isButton(GamepadButton.R1, state) ||
                gamepadInput.isButton(GamepadButton.R2, state),
        })

    isModifierHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.SHIFT),
            gamepad: () => gamepadInput.isButtonHeld(GamepadButton.L1),
        })

    getMousePos = () => {
        if (isGamepadMode) {
            if (!gamepadMousePos) {
                gamepadMousePos = input.mousePos
            }
            return gamepadMousePos
        }
        return input.mousePos
    }

    getWorldSpaceMousePos = () => {
        return this.translateToWorldSpace(this.getMousePos())
    }

    getScrollDeltaY = () => {
        return isGamepadMode ? deaden(gamepadInput.getRightAxes()).y : input.mouseWheelDeltaY
    }

    getPlayerFacingDirection = (dude: Dude) => {
        if (isGamepadMode) {
            const axis = gamepadInput.getRightAxes().x
            if (axis < -AXIS_DEAD_ZONE) {
                return -1
            } else if (axis > AXIS_DEAD_ZONE) {
                return 1
            }
            return 0
        } else {
            return Math.sign(this.translateToWorldSpace(input.mousePos).x - dude.standingPosition.x)
        }
    }

    vibrate = (options: GamepadVibrationOptions) => {
        if (isGamepadMode) {
            gamepadInput?.vibrate(options)
        }
    }

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
