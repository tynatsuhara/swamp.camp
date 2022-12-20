import { assets, Point } from "brigsby/dist"
import { player } from "../characters/player"
import { Settings } from "../Settings"

/**
 * Used for general purpose one-off sound effects
 */
export class Sounds {
    /**
     * @returns a promise that will resolve when the sound starts playing
     */
    static play(path: string, volume: number = 1): Promise<HTMLAudioElement> {
        const audio = assets.getAudioByFileName(path)

        if (!audio?.src) {
            console.log(`audio file [${path}] not loaded`)
            return Promise.reject()
        }

        audio.volume = Math.min(1, Settings.getSoundVolume() * volume)

        return new Promise((resolve) => {
            audio.oncanplay = () => {
                audio.play()
                resolve(audio)
            }
        })
    }

    /**
     * Plays the sound at the specified point, dropping off ~linearly
     */
    static playAtPoint(path: string, volume: number, point: Point, range: number) {
        const distanceToPlayer = player().standingPosition.manhattanDistanceTo(point)
        if (range < distanceToPlayer) {
            return
        }
        const vol = Math.max(0, (range - distanceToPlayer) / range)
        Sounds.play(path, volume * vol)
    }
}
