import {
    ButtonState,
    CapturedGamepad,
    CapturedInput,
    Component,
    Entity,
    expose,
    GamepadButton,
    GamepadVibrationOptions,
    InputKey,
    MouseButton,
    Point,
    PointValue,
    UpdateData,
} from "brigsby/dist"
import { Maths } from "brigsby/dist/util/Maths"
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

// TODO! TODO! TODO! Track "hasReceivedAnyMouseMovement" to make jumping in immediately with a controller a nicer experience

export type DPadValue =
    | GamepadButton.UP
    | GamepadButton.DOWN
    | GamepadButton.LEFT
    | GamepadButton.RIGHT

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

const check = <T>({ kbm, gamepad }: InputHandlers<T>) => {
    if (!input) {
        console.error(
            "Input is being checked before it is initialized. Make sure the controls singleton is updated before anything else."
        )
    }

    const kbmResult = kbm()
    if (kbmResult || !gamepadInput) {
        isGamepadMode = false
        gamepadMousePos = undefined
        return kbmResult
    }

    const gamepadResult = gamepad()
    if (gamepadResult) {
        isGamepadMode = true
    }

    return gamepadResult
}

const AXIS_DEAD_ZONE = 0.3
const CURSOR_SENSITIVITY = 0.35

const deadenAxis = (axis: number) => {
    if (axis < AXIS_DEAD_ZONE && axis > -AXIS_DEAD_ZONE) {
        return 0
    }
    // scale it 0-1 excluding the dead zone
    return (Math.sign(axis) * (Math.abs(axis) - AXIS_DEAD_ZONE)) / (1 - AXIS_DEAD_ZONE)
}

const deaden = (axes: Point) => axes.apply(deadenAxis)

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
        expose({ gamepad: gamepadInput })

        if (!gamepadInput || (isGamepadMode && input.mousePosDelta.magnitude() > 0)) {
            isGamepadMode = false
            gamepadMousePos = undefined
            // check debug as non-gamepad mode
            checkDebug(updateData.elapsedTimeMillis)
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
        if (isGamepadMode) {
            if (gamepadInput.isButton(GamepadButton.SELECT, ButtonState.DOWN)) {
                if (FullScreenMode.isFullScreen()) {
                    FullScreenMode.exit()
                } else {
                    FullScreenMode.enter()
                }
            }
        }

        // check debug as gamepad mode
        checkDebug(updateData.elapsedTimeMillis)
    }

    updateGamepadCursorPosition(elapsedTimeMillis: number) {
        if (!isGamepadMode || !gamepadInput) {
            return
        }

        const currentGamePadMousePos = this.getMousePos()

        const rightStick = deaden(gamepadInput.getRightAxes())
        const stickInput = rightStick.times(elapsedTimeMillis * CURSOR_SENSITIVITY)

        this.setGamepadCursorPosition(currentGamePadMousePos.plus(stickInput))
    }

    setGamepadCursorPosition({ x, y }: PointValue) {
        if (!isGamepadMode || !gamepadInput) {
            return
        }

        const bounds = Camera.instance.dimensions.minus(new Point(3, 3))
        gamepadMousePos = new Point(Maths.clamp(x, 0, bounds.x), Maths.clamp(y, 0, bounds.y))
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

    isInventoryStackPickUpOrDrop = () =>
        check({
            kbm: () => {
                // on touchscreens, allow real drag and drop
                if (input.pointerType === "touch") {
                    return input.isMouseDown || input.isMouseUp
                }
                // with a mouse, clicking twice is nicer than holding the mouse down while dragging
                return input.isMouseDown
            },
            gamepad: () =>
                gamepadInput.isButtonDown(GamepadButton.X) ||
                // using the touchpads as joysticks is great on Steam Deck
                gamepadInput.isButtonDown(GamepadButton.R3) ||
                gamepadInput.isButtonUp(GamepadButton.R3),
        })

    getInventoryStackPickUpOrDropString = () =>
        isGamepadMode ? TextIcon.GAMEPAD_X : TextIcon.MOUSE_LEFT

    isInventoryStackPickUpHalfOrDropOne = () =>
        check({
            kbm: () => input.isRightMouseDown,
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.R2),
        })

    getInventoryStackPickUpHalfOrDropOneString = () => (isGamepadMode ? "R2" : TextIcon.MOUSE_RIGHT)

    isInventorySwap = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.SHIFT) && input.isMouseDown,
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.R3),
        })

    getInventorySwapString = () => (isGamepadMode ? "R3" : "[shift]+" + TextIcon.MOUSE_LEFT)

    // ======== PAUSE MENU STUFF ========

    isAudioDecreaseModifierHeld = () =>
        check({
            kbm: () => input.isKeyHeld(InputKey.SHIFT),
            gamepad: () => gamepadInput.isButtonHeld(GamepadButton.L1),
        })

    isOpenPauseMenuButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.TAB),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.START),
        })

    isNextTipButtonwDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.D),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.RIGHT),
        })

    isPrevTipButtonwDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.A),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.LEFT),
        })

    getCycleTipString = () =>
        isGamepadMode ? `${TextIcon.GAMEPAD_LEFT}/${TextIcon.GAMEPAD_RIGHT}` : "[a/d]"

    // ======== OTHER MENU STUFF ========

    isCloseMenuButtonDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.TAB),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.CIRCLE),
        })

    getCloseMenuButtonString = () => (isGamepadMode ? TextIcon.GAMEPAD_CIRCLE : "[tab]")

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

    getTabButtonsString = () => (isGamepadMode ? "L1/R1" : "[a/d]")

    isMenuClickDown = () =>
        check({
            kbm: () => input.isMouseDown,
            gamepad: () =>
                gamepadInput.isButtonDown(GamepadButton.X) ||
                gamepadInput.isButtonDown(GamepadButton.R3),
        })

    getMenuClickDownString = () => (isGamepadMode ? TextIcon.GAMEPAD_X : TextIcon.MOUSE_LEFT)

    isDPadDown = (btn: DPadValue) =>
        check({ kbm: () => false, gamepad: () => gamepadInput.isButtonDown(btn) })

    isRightStickMoving() {
        return !deaden(gamepadInput.getRightAxes()).equals(Point.ZERO)
    }

    // ======== PLAYER CONTROLS ========

    isInteractDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.E),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.X),
        })

    getInteractButtonString = () => (isGamepadMode ? TextIcon.GAMEPAD_X : "[e]")

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

    getBlockString = () => (isGamepadMode ? "L1" : TextIcon.MOUSE_RIGHT)

    isRollDown = () =>
        check({
            kbm: () => input.isKeyDown(InputKey.SHIFT),
            gamepad: () => gamepadInput.isButtonDown(GamepadButton.CIRCLE),
        })

    getRollString = () => (isGamepadMode ? TextIcon.GAMEPAD_CIRCLE : "[shift]")

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

    getSheathKeyString = () => (isGamepadMode ? TextIcon.GAMEPAD_DOWN : "[f]")

    isAttack = (state: ButtonState) =>
        check({
            kbm: () => input.isMouse(MouseButton.LEFT, state),
            gamepad: () =>
                gamepadInput.isButton(GamepadButton.R1, state) ||
                gamepadInput.isButton(GamepadButton.R2, state),
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
        return isGamepadMode ? deadenAxis(gamepadInput.getLeftAxes().y) : input.mouseWheelDeltaY
    }

    getPlayerFacingDirection = (dude: Dude) => {
        return Math.sign(
            isGamepadMode
                ? deadenAxis(gamepadInput.getRightAxes().x)
                : this.translateToWorldSpace(input.mousePos).x - dude.standingPosition.x
        )
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

let devToolsOpenCountdown: number
const checkDebug = (elapsedTimeMillis: number) => {
    const openDevToolsGamepadButtons = [
        GamepadButton.L1,
        GamepadButton.L2,
        GamepadButton.L3,
        GamepadButton.R1,
        GamepadButton.R2,
        GamepadButton.R3,
    ]
    const gamepadTrigger =
        isGamepadMode && openDevToolsGamepadButtons.every((b) => gamepadInput.isButtonHeld(b))

    const openDevToolsKeyboardButtons = [InputKey.SHIFT, InputKey.SHIFT_RIGHT]
    const kbTrigger = !isGamepadMode && openDevToolsKeyboardButtons.every((b) => input.isKeyHeld(b))

    if (gamepadTrigger || kbTrigger) {
        if (devToolsOpenCountdown > 0) {
            devToolsOpenCountdown -= elapsedTimeMillis
            if (devToolsOpenCountdown < 0) {
                console.log("[native only] opening devtools")
                document.dispatchEvent(new Event("swamp-camp-open-devtools"))
            }
        }
    } else {
        devToolsOpenCountdown = 2_500
    }
}

/**
 * This is a special type of singleton that should never be destroyed.
 * It should always be updated in the component lifecycle before any
 * components which need to check for user input.
 */
export const controls = new Entity().addComponent(new ControlsWrapper())
