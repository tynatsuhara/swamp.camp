import { debug } from "../../engine/Debug"
import { UpdateViewsContext } from "../../engine/Engine"
import { Entity } from "../../engine/Entity"
import { Point } from "../../engine/Point"
import { TileComponent } from "../../engine/tiles/TileComponent"
import { DudeAnimationUtils } from "../characters/DudeAnimationUtils"
import { DevControls } from "../DevControls"
import { saveManager } from "../SaveManager"
import { MainMenuButton } from "../ui/MainMenuButton"
import { PlumePicker } from "../ui/PlumePicker"

const ZOOM = 3

export class MainMenuScene {

    private readonly continueFn: () => void
    private readonly newGameFn: () => void

    private readonly plumes: PlumePicker = new PlumePicker(color => {
        this.knight = new Entity().addComponent(
            DudeAnimationUtils.getCharacterIdleAnimation("knight_f", { color }).toComponent()
        )
    })
    private knight: TileComponent

    private newGame: boolean

    constructor(continueFn: () => void, newGameFn: () => void) {
        this.continueFn = continueFn
        this.newGameFn = newGameFn

        // Verify that the existing save is compatible
        if (saveManager.saveFileExists() && !saveManager.isSaveFormatVersionCompatible()) {
            // TODO: add a mechanism for upgrading saves when it's worth the effort
            console.log("archiving incompatible save file")
            saveManager.archiveSave()
        }

        if (saveManager.saveFileExists() && debug.autoPlay) {
            this.continueFn()
        }
    }
    
    getViews(updateViewsContext: UpdateViewsContext) {
        DevControls.checkDevControls(updateViewsContext.input)

        const dimensions = updateViewsContext.dimensions.div(ZOOM)
        const saveFileExists = saveManager.saveFileExists()
        const center = dimensions.floorDiv(2)
        const lineSpacing = 16

        const menuTop = center.plusY(-20)
        this.plumes.position = menuTop
        this.knight.transform.position = menuTop.minus(this.knight.transform.dimensions.floorDiv(2).plusY(24))

        const buttons: MainMenuButton[] = []

        if (this.newGame) {
            const top = menuTop.plusY(42)
            buttons.push(new MainMenuButton(top, `start${saveFileExists ? " (delete old save)" : ""}`, this.newGameFn))
            if (saveFileExists) {
                buttons.push(new MainMenuButton(top.plusY(lineSpacing), "cancel", () => { 
                    this.newGame = false 
                    this.plumes.reset()
                }))
            }
        } else {
            if (saveFileExists) {
                buttons.push(new MainMenuButton(menuTop, "load last save", this.continueFn))
            }
            buttons.push(new MainMenuButton(menuTop.plusY(lineSpacing * buttons.length), "New game", () => { this.newGame = true }))
        }

        const entities = [
            this.knight.entity, 
            new Entity(buttons)
        ]

        if (this.newGame) {
            entities.push(this.plumes.entity)
        }

        return [{ 
            zoom: ZOOM,
            offset: Point.ZERO,
            entities
        }];
    }
}