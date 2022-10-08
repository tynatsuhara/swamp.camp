import { Lists } from "brigsby/dist/util"
import { loadAudio } from "./DeferLoadAudio"
import { Sounds } from "./Sounds"

const VOLUME = 0.4

const SHORT = [17, 18, 19, 21, 6, 4]
const MEDIUM = [0, 16, 20]
const MEDIUM_LONG = [3, 9, 5, 1, 8]
const LONG = [2, 7, 10, 11]

const AUDIO_FILES = Lists.range(0, 22).map((i) => `audio/talkingsynth/TalkingSynth_${i}.wav`)
loadAudio(AUDIO_FILES)

let currentAudio: HTMLAudioElement

export const startTalkingSounds = (lineLength: number) => {
    let audioOptions: number[]
    if (lineLength < 30) {
        audioOptions = SHORT
    } else if (lineLength < 60) {
        audioOptions = MEDIUM
    } else if (lineLength < 90) {
        audioOptions = MEDIUM_LONG
    } else {
        audioOptions = LONG
    }
    const audioToPlay = AUDIO_FILES[Lists.oneOf(audioOptions)]

    if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
    }

    console.log(`line length = ${lineLength}, playing speech audio ${audioToPlay}`)

    Sounds.play(audioToPlay, VOLUME).then((audio) => {
        currentAudio = audio
        audio.onended = () => {
            if (currentAudio === audio) {
                currentAudio = null
            }
        }
    })
}
