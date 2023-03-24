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

    // if this is true, input observed by other components (like the player)
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() {
        return this.captureInput
    }

    get menus(): { close: () => void; getEntities: () => Entity[]; isOpen: boolean }[] {
        return [
            InventoryDisplay.instance,
            DialogueDisplay.instance,
            PlaceElementDisplay.instance,
            PauseMenu.instance,
            CraftingMenu.instance,
            TradeMenu.instance,
        ]
    }

    get(): Entity[] {
        if (!player()) {
            return []
        }

        this.captureInput =
            this.menus.some((m) => m.isOpen) ||
            spawnMenu.isOpen ||
            TextOverlayManager.instance.isActive

        return HUD.instance
            .getEntities()
            .concat(this.menus.flatMap((m) => m.getEntities()))
            .concat(NotificationDisplay.instance.getEntities())
            .concat(MenuHints.instance.getEntities()) // put this last since it checks other menus
    }

    closeAny() {
        this.menus.forEach((m) => {
            if (m.isOpen) {
                m.close()
            }
        })
    }
}
