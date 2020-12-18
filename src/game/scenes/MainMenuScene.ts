import { UpdateViewsContext } from "../../engine/engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/point"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { saveManager } from "../SaveManager"
import { ButtonsMenu, OptionButton } from "../ui/ButtonsMenu"
import { Color } from "../ui/Color"

const ZOOM = 3

export class MainMenuScene {

    private readonly continueFn: () => void
    private readonly newGameFn: () => void

    private readonly knight: TileComponent = new Entity().addComponent(
        DudeAnimationUtils.getCharacterIdleAnimation("knight_f", {}).toComponent()
    )

    constructor(continueFn: () => void, newGameFn: () => void) {
        this.continueFn = continueFn
        this.newGameFn = newGameFn
    }
    
    getViews(updateViewsContext: UpdateViewsContext) {
        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const saveFileExists = saveManager.saveFileExists()

        const knightOffset = saveFileExists ? 43 : 33
        this.knight.transform.position = dimensions.div(2).minus(this.knight.transform.dimensions.div(2).plusY(knightOffset + 8))

        const buttonColor = "red"
        const textColor = Color.PINK
        const hoverColor = Color.WHITE

        const buttons: OptionButton[] = saveFileExists
            ? 
                [{
                    text: "Load last save".toUpperCase(), 
                    fn: this.continueFn,
                    buttonColor, textColor, hoverColor,
                },
                {
                    text: "New game (destroy last save)".toUpperCase(), 
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
            entities: [ButtonsMenu.render(dimensions, "red", buttons), this.knight.entity]
        }];
    }
}