import { Entity } from "brigsby/dist"
import { Dude } from "../Dude"
import { AbstractPlayer } from "./AbstractPlayer"

let playerInstance: AbstractPlayer

export const registerPlayerInstance = (player: AbstractPlayer) => {
    playerInstance = player
}

/**
 * @returns A reference to the local player
 */
export const player = (): {
    dude: Dude
    enabled: boolean
    entity: Entity
} => {
    return playerInstance
}

export const resetPlayerInstances = () => {
    playerInstance = undefined
}
