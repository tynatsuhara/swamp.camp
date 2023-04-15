import { Entity, Point } from "brigsby/dist"
import { MainMenuButton } from "./MainMenuButton"

export class MainMenuButtonSection {
    static readonly LINE_SPACING = 16

    private readonly buttons: MainMenuButton[] = []

    constructor(private readonly topCenter: Point) {
        console.log("new button section")
    }

    add(text: string, onClick: () => void, condition = true, onHover: () => void = () => {}) {
        if (condition) {
            const pos = this.topCenter.plusY(
                MainMenuButtonSection.LINE_SPACING * this.buttons.length
            )

            const autoSelect = !this.buttons.some((b) => b?.hoverable)
            this.buttons.push(
                new MainMenuButton({
                    centerPos: pos,
                    text,
                    onClick,
                    onHover,
                    hoverable: true,
                    autoSelect,
                })
            )
        }
        return this
    }

    addText(text: string) {
        this.buttons.push(
            new MainMenuButton({
                centerPos: this.topCenter.plusY(
                    MainMenuButtonSection.LINE_SPACING * this.buttons.length
                ),
                text,
                onClick: () => {},
                onHover: () => {},
                hoverable: false,
                autoSelect: false,
            })
        )
        return this
    }

    addLineBreak() {
        this.buttons.push(null)
        return this
    }

    getEntity = () => new Entity(this.buttons)
}
