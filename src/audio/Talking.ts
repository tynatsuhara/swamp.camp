import { SoundPool } from "./SoundPool"
import { Sounds } from "./Sounds"

const VOLUME = 0.4

const toFilePath = (i: number) => `audio/talkingsynth/TalkingSynth_${i}.wav`
const SHORT = new SoundPool([17, 18, 19, 21, 6, 4].map(toFilePath))
const MEDIUM = new SoundPool([0, 16, 20].map(toFilePath))
const MEDIUM_LONG = new SoundPool([3, 9, 5, 1, 8].map(toFilePath))
const LONG = new SoundPool([2, 7, 10, 11].map(toFilePath))

let currentAudio: Howl

export const startTalkingSounds = (lineLength: number) => {
    let pool: SoundPool
    if (lineLength < 30) {
        pool = SHORT
    } else if (lineLength < 60) {
        pool = MEDIUM
    } else if (lineLength < 90) {
        pool = MEDIUM_LONG
    } else {
        pool = LONG
    }

    stopTalkingSounds()

    // console.log(`line length = ${lineLength}, playing speech audio ${audioToPlay}`)

    Sounds.play(pool.next(), VOLUME).then((howl) => {
        currentAudio = howl
        howl.once("end", () => {
            if (currentAudio === howl) {
                currentAudio = null
            }
        })
    })
}

export const stopTalkingSounds = () => {
    if (currentAudio) {
        currentAudio.stop()
        currentAudio = null
    }
}
