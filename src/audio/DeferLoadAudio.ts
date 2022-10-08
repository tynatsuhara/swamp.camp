import { assets } from "brigsby/dist"

const audioLoadQueue: string[] = []
let deferLoad = true

/**
 * Load the provided audio files ASAP, but don't block the main menu from rendering
 */
export const loadAudio = (urls: string[]) => {
    if (deferLoad) {
        audioLoadQueue.push(...urls)
    } else {
        assets.loadAudioFiles(urls)
    }
}

/**
 * Begin loading all audio files which were loadAudio
 */
export const loadDeferredAudio = () => {
    deferLoad = false
    assets.loadAudioFiles(audioLoadQueue)
}
