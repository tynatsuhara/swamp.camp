import { Entity } from "../../engine/Entity"
import { HUD } from "./HUD"
import { Player } from "../characters/Player"
import { Dude } from "../characters/Dude"
import { InventoryDisplay } from "./InventoryDisplay"
import { UpdateViewsContext } from "../../engine/engine"

export class UIStateManager {
    static instance: UIStateManager
    static UI_SPRITE_DEPTH = Number.MAX_SAFE_INTEGER/2

    private readonly hud = new HUD()
    private readonly inventory = new InventoryDisplay()

    // if this is true, input observed by other components (like the player) 
    // should be skipped because a menu is open. Other menus should only open
    // if this is false
    private captureInput = false
    get isMenuOpen() { return this.captureInput }

    constructor() {
        UIStateManager.instance = this
    }

    get(context: UpdateViewsContext): Entity[] {

        this.captureInput = this.inventory.isOpen

        return [
            this.hud.getEntity(Player.instance.entity.getComponent(Dude)),
            this.inventory.getEntity()
        ]
    }
}