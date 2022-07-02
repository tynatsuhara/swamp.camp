import { Entity, Point } from "brigsby/lib"
import { MainMenuButton } from "./MainMenuButton"

export class MainMenuButtonSection {
    static readonly LINE_SPACING = 16

    private readonly buttons: MainMenuButton[] = []
    private readonly topCenter: Point

    constructor(topCenter: Point) {
        this.topCenter = topCenter
    }

    add(text: string, onClick: () => void, condition = true, onHover: () => void = () => {}) {
        if (condition) {
            this.buttons.push(
                new MainMenuButton(
                    this.topCenter.plusY(MainMenuButtonSection.LINE_SPACING * this.buttons.length),
                    text,
                    onClick,
                    onHover,
                    true
                )
            )
        }
        return this
    }

    addText(text: string) {
        this.buttons.push(
            new MainMenuButton(
                this.topCenter.plusY(MainMenuButtonSection.LINE_SPACING * this.buttons.length),
                text,
                () => {},
                () => {},
                false
            )
        )
        return this
    }

    addLineBreak() {
        this.buttons.push(null)
        return this
    }

    getEntity = () => new Entity(this.buttons)
}
