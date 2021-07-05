import { Music } from "./audio/Music"

interface SerializedSettings {
    musicVolume?: number  // 0-1
    soundVolume?: number  // 0-1
}

const DEFAULT_SETTINGS: SerializedSettings = {
    musicVolume: 0.5,
    soundVolume: 1,
}

const loadSettings = () => {
    const json = localStorage.getItem("settings")
    return !!json ? JSON.parse(json) as SerializedSettings : null
}

const settings: SerializedSettings = loadSettings() || DEFAULT_SETTINGS

const saveSettings = () => localStorage.setItem("settings", JSON.stringify(settings))

export const Settings = {
    getMusicVolume: () => settings.musicVolume,
    increaseMusicVolume: () => {
        const volume = settings.musicVolume === 1 ? 0 : Math.floor(settings.musicVolume * 100 + 10)/100
        settings.musicVolume = volume
        Music.setVolume(settings.musicVolume)
        saveSettings()
    },
    decreaseMusicVolume: () => {
        const volume = settings.musicVolume === 0 ? 1 : Math.floor(settings.musicVolume * 100 - 10)/100
        settings.musicVolume = volume
        Music.setVolume(settings.musicVolume)
        saveSettings()
    },

    getSoundVolume: () => settings.soundVolume,
    increaseSoundVolume: () => {
        const volume = settings.soundVolume === 1 ? 0 : Math.floor(settings.soundVolume * 100 + 10)/100
        settings.soundVolume = volume
        saveSettings()
    },
    decreaseSoundVolume: () => {
        const volume = settings.soundVolume === 0 ? 1 : Math.floor(settings.soundVolume * 100 - 10)/100
        settings.soundVolume = volume
        saveSettings()
    },
}

Music.setVolume(Settings.getMusicVolume())
