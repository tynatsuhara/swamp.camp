import { Entity } from "brigsby/dist/Entity"
import { HUD } from "./HUD"
import { Player } from "../characters/Player"
import { InventoryDisplay } from "./InventoryDisplay"
import { DialogueDisplay } from "./DialogueDisplay"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { PauseMenu } from "./PauseMenu"
import { CraftingMenu } from "./CraftingMenu"
import { SellMenu } from "./SellMenu"
import { NotificationDisplay } from "./NotificationDisplay"
import { Camera } from "../cutscenes/Camera"
import { Singletons } from "../Singletons"

export class UIStateManager {

    static get instance() {
        return Singletons.getOrCreate(UIStateManager)
    }
    
    static UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER/2

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

    get(elapsedMillis: number): Entity[] {
        if (!Player.instance.dude) {
            return []
        }

        this.captureInput = this.inventory.isOpen 
                || this.dialogueDisplay.isOpen 
                || this.placeElementDisplay.isOpen
                || this.pauseMenu.isOpen
                || this.craftingMenu.isOpen
                || this.sellMenu.isOpen

        return HUD.instance.getEntities(Player.instance.dude, Camera.instance.dimensions, elapsedMillis)
                .concat(this.inventory.getEntities())
                .concat(this.dialogueDisplay.getEntities())
                .concat(this.placeElementDisplay.getEntities())
                .concat(this.pauseMenu.getEntities())
                .concat(this.craftingMenu.getEntities())
                .concat(this.sellMenu.getEntities())
                .concat(this.notificationDisplay.getEntities())
    }
}