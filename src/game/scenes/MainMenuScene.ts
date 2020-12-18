import { UpdateViewsContext } from "../../engine/engine"
import { Point } from "../../engine/point"
import { ButtonsMenu, OptionButton } from "../ui/ButtonsMenu"
import { Color } from "../ui/Color"
import { saveManager } from "../SaveManager"

const ZOOM = 3

export class MainMenuScene {

    private readonly continueFn: () => void
    private readonly newGameFn: () => void

    constructor(continueFn: () => void, newGameFn: () => void) {
        this.continueFn = continueFn
        this.newGameFn = newGameFn
    }
    
    getViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const buttonColor = "red"
        const textColor = Color.PINK
        const hoverColor = Color.WHITE

        const buttons: OptionButton[] = saveManager.saveFileExists()
            ? 
                [{
                    text: "Load last save".toUpperCase(), 
                    fn: this.continueFn,
                    buttonColor, textColor, hoverColor,
                },
                {
                    text: "New game (destroy existing save)".toUpperCase(), 
                    fn: this.newGameFn,
                    buttonColor, textColor, hoverColor,
                }]
            :
                [{
                    text: "New game".toUpperCase(), 
                    fn: this.newGameFn,
                    buttonColor, textColor, hoverColor,
                }]

        return [{ 
            zoom: ZOOM,
            offset: Point.ZERO,
            entities: [ButtonsMenu.render(dimensions, "red", buttons)]
        }];
    }
}