const audioLoadQueue: string[] = []
let deferLoad = true

const actuallyLoad = (urls: string[]) => {
    urls.forEach((url) => {
        new Howl({
            src: url,
            // this is true by default, but we set it to be explicit
            preload: true,
        })
    })
}

/**
 * Load the provided audio files ASAP, but don't block the main menu from rendering
 * @returns the urls passed in for easier chaining
 */
export const loadAudio = (urls: string[]) => {
    if (deferLoad) {
        audioLoadQueue.push(...urls)
    } else {
        actuallyLoad(urls)
    }
    return urls
}

/**
 * Begin loading all audio files which were loadAudio
 */
export const loadDeferredAudio = () => {
    deferLoad = false
    audioLoadQueue.length = 0
    actuallyLoad(audioLoadQueue)
}
