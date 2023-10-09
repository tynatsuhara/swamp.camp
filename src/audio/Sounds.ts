import { Point } from "brigsby/dist"
import { Howl } from "howler"
import { player } from "../characters/player"

/**
 * Used for general purpose one-off sound effects
 */
// TODO convert to howler
export class Sounds {
    /**
     * @returns a promise that will resolve when the sound starts playing
     */
    static play(path: string, volume: number = 1): Promise<Howl> {
        const sound = new Howl({ src: path, volume })

        return new Promise((resolve) => {
            if (sound.state() === "loaded") {
                sound.play()
                resolve(sound)
            } else {
                sound.once("load", () => {
                    sound.play()
                    resolve(sound)
                })
            }
        })
    }

    /**
     * Plays the sound at the specified point, dropping off ~linearly
     */
    static playAtPoint(path: string, volume: number, point: Point) {
        if (!player()) {
            return
        }
        const range = 160 // 10 tiles, pretty arbitrary
        const distanceToPlayer = player().standingPosition.manhattanDistanceTo(point)
        if (range < distanceToPlayer) {
            return
        }
        const vol = Math.max(0, (range - distanceToPlayer) / range)
        Sounds.play(path, volume * vol)
    }
}
