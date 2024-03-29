import { Dude } from "../Dude"
import { AbstractPlayer } from "./AbstractPlayer"

let playerInstance: AbstractPlayer

export const registerPlayerInstance = (player: AbstractPlayer) => {
    playerInstance = player
}

/**
 * @returns A reference to the local player
 */
export const player = (): Dude => {
    return playerInstance?.dude
}

export const resetPlayerInstances = () => {
    playerInstance = undefined
}
