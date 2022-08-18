import { assets, Point } from "brigsby/dist"
import { Player } from "../characters/Player"
import { Settings } from "../Settings"

/**
 * Used for general purpose one-off sound effects
 */
export class Sounds {
    /**
     * @returns a promise that will resolve when the sound starts playing
     */
    static play(path: string, volume: number = 1): Promise<void> {
        const audio = assets.getAudioByFileName(path)

        if (!audio?.src) {
            console.log(`audio file [${path}] not loaded`)
            return
        }

        audio.volume = Math.min(1, Settings.getSoundVolume() * volume)

        return new Promise((resolve) => {
            audio.oncanplay = () => {
                audio.play()
                resolve()
            }
        })
    }

    static playAtPoint(path: string, volume: number, point: Point, distance: number) {
        const distanceToPlayer = Player.instance.dude.standingPosition.manhattanDistanceTo(point)
        if (distance < distanceToPlayer) {
            return
        }
        const vol = Math.max(0, (distance - distanceToPlayer) / distance)
        Sounds.play(path, volume * vol)
    }
}
