import { Entity } from "../../engine/Entity"
import { HUD } from "./HUD"
import { Player } from "../characters/Player"
import { InventoryDisplay } from "./InventoryDisplay"
import { DialogueDisplay } from "./DialogueDisplay"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { Point } from "../../engine/point"
import { PauseMenu } from "./PauseMenu"
import { CraftingMenu } from "./CraftingMenu"
import { SellMenu } from "./SellMenu"
import { NotificationDisplay } from "./NotificationDisplay"
import { Mouse } from "./Mouse"
import { debug } from "../../engine/debug"

export class UIStateManager {

    private static _instance: UIStateManager
    static get instance(): UIStateManager {
        if (!this._instance) {
            this._instance = new UIStateManager()
        }
        return this._instance
    }
    
    static UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER/2

    private readonly hud = new HUD()
    private readonly inventory = new InventoryDisplay()
    private readonly dialogueDisplay = new DialogueDisplay()
    private readonly placeElementDisplay = new PlaceElementDisplay()
    private readonly pauseMenu = new PauseMenu()
    private readonly craftingMenu = new CraftingMenu()
    private readonly sellMenu = new SellMenu()
    private readonly notificationDisplay = new NotificationDisplay()

    // if this is true, input observed by other components (like the player) 
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() { return this.captureInput }

    private constructor() {
        UIStateManager._instance = this
    }

    // Resets the singleton UIStateManager
    destroy() {
        UIStateManager._instance = new UIStateManager()
    }

    get(dimensions: Point, elapsedMillis: number): Entity[] {
        if (!Player.instance.dude) {
            return []
        }

        this.captureInput = this.inventory.isOpen 
                || this.dialogueDisplay.isOpen 
                || this.placeElementDisplay.isOpen
                || this.pauseMenu.isOpen
                || this.craftingMenu.isOpen
                || this.sellMenu.isOpen
                
        if (this.captureInput || debug.alwaysShowMouse) {
            Mouse.show()
        } else {
            Mouse.hide()
        }

        return this.hud.getEntities(Player.instance.dude, dimensions, elapsedMillis)
                .concat(this.inventory.getEntities())
                .concat(this.dialogueDisplay.getEntities())
                .concat(this.placeElementDisplay.getEntities())
                .concat(this.pauseMenu.getEntities())
                .concat(this.craftingMenu.getEntities())
                .concat(this.sellMenu.getEntities())
                .concat(this.notificationDisplay.getEntities())
    }
}