import { Entity } from "../../engine/Entity"
import { HUD } from "./HUD"
import { Player } from "../characters/Player"
import { InventoryDisplay } from "./InventoryDisplay"
import { DialogueDisplay } from "./DialogueDisplay"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { Point } from "../../engine/point"
import { PauseMenu } from "./PauseMenu"

export class UIStateManager {
    static instance: UIStateManager
    static UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER/2

    private readonly hud = new HUD()
    private readonly inventory = new InventoryDisplay()
    private readonly dialogueDisplay = new DialogueDisplay()
    private readonly placeElementDisplay = new PlaceElementDisplay()
    private readonly pauseMenu = new PauseMenu()

    // if this is true, input observed by other components (like the player) 
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() { return this.captureInput }

    constructor() {
        UIStateManager.instance = this
    }

    get(dimensions: Point, elapsedMillis: number): Entity[] {
        if (!Player.instance.dude) {
            return []
        }

        this.captureInput = this.inventory.isOpen 
                || this.dialogueDisplay.isOpen 
                || this.placeElementDisplay.isOpen
                || this.pauseMenu.isOpen

        return this.hud.getEntities(Player.instance.dude, dimensions, elapsedMillis)
                .concat(this.inventory.getEntities())
                .concat(this.dialogueDisplay.getEntities())
                .concat(this.placeElementDisplay.getEntities())
                .concat(this.pauseMenu.getEntities())
    }
}