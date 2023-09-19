import { isGamePaused } from "../../core/PauseState"

const internalCallbackMap: Record<number, number> = {}

const requestInternal = (fn: () => void, originalId?: number): number => {
    const rafId = requestAnimationFrame(() => {
        if (isGamePaused()) {
            console.log("hmm")
            requestInternal(fn, originalId ?? rafId)
        } else {
            fn()
            delete internalCallbackMap[originalId]
        }
    })

    const idKey = originalId ?? rafId
    internalCallbackMap[idKey] = rafId

    return idKey
}

export const requestGameAnimationFrame = (fn: () => void): number => {
    return requestInternal(fn)
}

export const cancelGameAnimationFrame = (id: number) => {
    const internalId = internalCallbackMap[id]
    cancelAnimationFrame(internalId)
    delete internalCallbackMap[id]
}
