import { Component, Entity, InputKey, InputKeyString, UpdateData } from "brigsby/dist"
import { Singletons } from "../core/Singletons"
import { ButtonsMenu, OptionButton } from "./ButtonsMenu"
import { Color } from "./Color"

export class OnScreenKeyboard extends Component {
    static get instance() {
        return Singletons.getOrCreate(OnScreenKeyboard)
    }

    isOpen = false

    private readonly e: Entity = new Entity([this]) // entity for this component
    private displayEntity: Entity

    update(updateData: UpdateData): void {
        const toggle = false //updateData.input.isKeyDown(InputKey.B)
        if (!toggle) {
            return
        }

        this.isOpen = !this.isOpen

        if (this.isOpen) {
            this.open(updateData)
        } else {
            this.close()
        }
    }

    private open(updateData: UpdateData) {
        const baseBtn: OptionButton = {
            text: "a",
            fn: () => console.log("adsfg"),
            buttonColor: "red",
            textColor: Color.PINK_3,
            hoverColor: Color.WHITE,
        }

        const buttonsRow1 = [
            InputKey.Q,
            InputKey.W,
            InputKey.E,
            InputKey.R,
            InputKey.T,
            InputKey.Y,
            InputKey.U,
            InputKey.I,
            InputKey.O,
            InputKey.P,
            InputKey.BACKSPACE,
        ]
        const buttonsRow2 = [
            InputKey.A,
            InputKey.S,
            InputKey.D,
            InputKey.F,
            InputKey.G,
            InputKey.H,
            InputKey.J,
            InputKey.K,
            InputKey.L,
            InputKey.QUOTE,
        ]
        const buttonsRow3 = [
            InputKey.Z,
            InputKey.X,
            InputKey.C,
            InputKey.V,
            InputKey.B,
            InputKey.N,
            InputKey.M,
        ]
        const buttonsRow4 = [InputKey.SPACE]

        const makeButtonRow = (row: Array<InputKey>) =>
            row.map((btn) => {
                return {
                    ...baseBtn,
                    text: (() => {
                        if (btn === InputKey.SPACE) {
                            return "      SPACE      "
                        } else if (btn === InputKey.BACKSPACE) {
                            return "<"
                        } else if (btn === InputKey.QUOTE) {
                            return "'"
                        }
                        return InputKeyString.for(btn)
                    })(),
                }
            })

        const { entity: displayEntity } = ButtonsMenu.render(
            "keyboard",
            "red",
            [buttonsRow1, buttonsRow2, buttonsRow3, buttonsRow4].map((r) => makeButtonRow(r)),
            updateData.dimensions.div(2)
        )
        this.displayEntity = displayEntity
    }

    close() {
        this.displayEntity?.selfDestruct()
        this.displayEntity = undefined
    }

    getEntities() {
        return [this.e, this.displayEntity]
    }
}
