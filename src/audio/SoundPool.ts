import { Lists } from "brigsby/dist/util"
import { loadAudio } from "./DeferLoadAudio"

/**
 * Used to play random sounds without immediately repeating the same sound.
 * Also handles loading as a convenience.
 */
export class SoundPool {
    private index = 0

    constructor(private paths: string[]) {
        Lists.shuffle(this.paths)
        loadAudio(paths)
    }

    next() {
        const next = this.paths[this.index]

        this.index++
        if (this.index === this.paths.length) {
            this.index = 0
            Lists.shuffle(this.paths)
            // don't repeat
            if (this.paths[0] === next) {
                this.paths.push(this.paths.shift())
            }
        }

        return next
    }

    /**
     * @param count Starting from 1, will look for this many sounds
     * @param tmpl A file path with %% as a placeholder for the number
     */
    static range(count: number, tmpl: string): SoundPool {
        const paths = Lists.range(1, count + 1).map((i) => tmpl.replace("%%", `${i}`))
        return new SoundPool(paths)
    }
}
