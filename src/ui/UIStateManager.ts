import { Entity } from "brigsby/dist"
import { player } from "../characters/player"
import { TextOverlayManager } from "../cutscenes/TextOverlayManager"
import { spawnMenu } from "../debug/SpawnMenu"
import { Singletons } from "../Singletons"
import { CraftingMenu } from "./CraftingMenu"
import { DialogueDisplay } from "./DialogueDisplay"
import { HUD } from "./HUD"
import { InventoryDisplay } from "./InventoryDisplay"
import { MenuHints } from "./MenuHints"
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

    // if this is true, input observed by other components (like the player)
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() {
        return this.captureInput
    }

    get(): Entity[] {
        if (!player()) {
            return []
        }

        this.captureInput =
            InventoryDisplay.instance.isOpen ||
            DialogueDisplay.instance.isOpen ||
            PlaceElementDisplay.instance.isOpen ||
            PauseMenu.instance.isOpen ||
            CraftingMenu.instance.isOpen ||
            TradeMenu.instance.isOpen ||
            spawnMenu.isOpen ||
            TextOverlayManager.instance.isActive

        return HUD.instance
            .getEntities()
            .concat(InventoryDisplay.instance.getEntities())
            .concat(DialogueDisplay.instance.getEntities())
            .concat(PlaceElementDisplay.instance.getEntities())
            .concat(PauseMenu.instance.getEntities())
            .concat(CraftingMenu.instance.getEntities())
            .concat(TradeMenu.instance.getEntities())
            .concat(NotificationDisplay.instance.getEntities())
            .concat(MenuHints.instance.getEntities()) // put this last since it checks other menus
    }
}
