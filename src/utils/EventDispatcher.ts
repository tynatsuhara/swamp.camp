import { Singletons } from "../core/Singletons"

const ID_PREFIX = "swamp-camp-evnt-"

/**
 * Utility wrapper around event listeners, to help reduce circular dependencies.
 * Simplifies creation of event dispatchers and listeners scoped to singletons.
 * This module should have as few imports as possible!
 */
export class EventDispatcher {
    static get instance() {
        return Singletons.getOrCreate(EventDispatcher)
    }

    private readonly listeners: Array<[string, (data: any) => void]> = []

    _onSingletonDelete() {
        this.listeners.forEach((idAndFn) => document.removeEventListener(...idAndFn))
    }

    dispatch(id: string, data?: any) {
        document.dispatchEvent(new CustomEvent(ID_PREFIX + id, { detail: data }))
    }

    listen(id: string, callback: (data?: any) => void) {
        id = ID_PREFIX + id
        const listener = (e: CustomEvent) => callback(e.detail)
        this.listeners.push([id, listener])
        document.addEventListener(id, listener)
    }
}
