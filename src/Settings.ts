import { Music } from "./audio/Music"

interface SerializedSettings {
    // sound settings are all 0-1
    musicVolume?: number
    soundVolume?: number
    ambienceVolume?: number
}

const DEFAULT_SETTINGS: SerializedSettings = {
    musicVolume: 0.5,
    soundVolume: 1,
    ambienceVolume: 1,
}

const loadSettings = () => {
    const json = localStorage.getItem("settings")
    return !!json ? (JSON.parse(json) as Partial<SerializedSettings>) : null
}

const settings: SerializedSettings = {
    ...DEFAULT_SETTINGS,
    ...loadSettings(),
}

const saveSettings = () => localStorage.setItem("settings", JSON.stringify(settings))

const adjustVolume = (key: keyof SerializedSettings, increase: boolean) => {
    if (increase) {
        settings[key] = settings[key] === 1 ? 0 : Math.floor(settings[key] * 100 + 10) / 100
    } else {
        settings[key] = settings[key] === 0 ? 1 : Math.floor(settings[key] * 100 - 10) / 100
    }

    saveSettings()

    return settings[key]
}

export const Settings = {
    getMusicVolume: () => settings.musicVolume,
    increaseMusicVolume: () => Music.setVolume(adjustVolume("musicVolume", true)),
    decreaseMusicVolume: () => Music.setVolume(adjustVolume("musicVolume", false)),

    getSoundVolume: () => settings.soundVolume,
    increaseSoundVolume: () => adjustVolume("soundVolume", true),
    decreaseSoundVolume: () => adjustVolume("soundVolume", false),

    getAmbienceVolume: () => settings.ambienceVolume,
    increaseAmbienceVolume: () => adjustVolume("ambienceVolume", true),
    decreaseAmbienceVolume: () => adjustVolume("ambienceVolume", false),
}

Music.setVolume(Settings.getMusicVolume())
