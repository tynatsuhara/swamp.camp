import { Entity } from "brigsby/dist"
import { player } from "../characters/player"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { spawnMenu } from "../debug/SpawnMenu"
import { Singletons } from "../Singletons"
import { CraftingMenu } from "./CraftingMenu"
import { DialogueDisplay } from "./DialogueDisplay"
import { DrawMenu } from "./DrawMenu"
import { HUD } from "./HUD"
import { InventoryDisplay } from "./InventoryDisplay"
import { NotificationDisplay } from "./NotificationDisplay"
import { PauseMenu } from "./PauseMenu"
import { PlaceElementDisplay } from "./PlaceElementDisplay"
import { TradeMenu } from "./TradeMenu"

export class UIStateManager {
    static get instance() {
        return Singletons.getOrCreate(UIStateManager)
    }

    static UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER / 2
    static SCROLL_SPEED = 0.25

    private readonly inventory = new InventoryDisplay()
    private readonly dialogueDisplay = new DialogueDisplay()
    private readonly placeElementDisplay = new PlaceElementDisplay()
    private readonly pauseMenu = new PauseMenu()
    private readonly craftingMenu = new CraftingMenu()
    private readonly sellMenu = new TradeMenu()
    private readonly notificationDisplay = new NotificationDisplay()
    private readonly drawMenu = new DrawMenu() // TODO

    // if this is true, input observed by other components (like the player)
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() {
        return this.captureInput
    }

    get(elapsedMillis: number): Entity[] {
        if (!player()) {
            return []
        }

        this.captureInput =
            this.inventory.isOpen ||
            this.dialogueDisplay.isOpen ||
            this.placeElementDisplay.isOpen ||
            this.pauseMenu.isOpen ||
            this.craftingMenu.isOpen ||
            this.sellMenu.isOpen ||
            this.drawMenu.isOpen ||
            spawnMenu.isOpen ||
            TextOverlayManager.instance.isActive

        return HUD.instance
            .getEntities()
            .concat(this.inventory.getEntities())
            .concat(this.dialogueDisplay.getEntities())
            .concat(this.placeElementDisplay.getEntities())
            .concat(this.pauseMenu.getEntities())
            .concat(this.craftingMenu.getEntities())
            .concat(this.sellMenu.getEntities())
            .concat(this.notificationDisplay.getEntities())
            .concat(this.drawMenu.getEntities())
    }
}
