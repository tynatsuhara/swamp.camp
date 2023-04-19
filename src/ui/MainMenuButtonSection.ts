import { AnonymousComponent, Entity, InputKey, Point } from "brigsby/dist"
import { MainMenuButton } from "./MainMenuButton"

export class MainMenuButtonSection {
    static readonly LINE_SPACING = 16

    private readonly buttons: MainMenuButton[] = []

    constructor(private readonly topCenter: Point, private readonly backFn?: () => void) {}

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

    getEntity() {
        return new Entity([
            ...this.buttons,
            new AnonymousComponent({
                update: ({ input }) => {
                    if (input.isKeyDown(InputKey.BACKSPACE)) {
                        this.backFn?.()
                    }
                },
            }),
        ])
    }
}
