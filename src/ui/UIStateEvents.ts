import { EventDispatcher } from "../utils/EventDispatcher"

/**
 * This event dispatching layer exists to reduce circular dependencies.
 * This module should have as few imports as possible!
 */
export const UIStateEvents = {
    openWorkbenchCraftingMenu: () => EventDispatcher.instance.dispatch("craft-workbench"),
}
