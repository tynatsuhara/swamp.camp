import { EventDispatcher } from "../../utils/EventDispatcher"

export const setGameTimeout = (fn: () => void, delay: number): void => {
    EventDispatcher.instance.dispatch("gametimeout", { fn, delay })
}
