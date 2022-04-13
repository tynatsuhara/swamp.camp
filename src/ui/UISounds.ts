import { assets } from "brigsby/dist/Assets"
import { Sounds } from "../audio/Sounds"

const SOUNDS = {
    CLICK: "audio/ui/switch22.ogg",
    ERROR_CLICK: "audio/rpg/interface/interface6.wav",
}

export const UISounds = {
    loadAll: () => assets.loadAudioFiles(Object.values(SOUNDS)),
    playClickSound: () => Sounds.play(SOUNDS.CLICK, 0.035),
    playErrorSound: () => Sounds.play(SOUNDS.ERROR_CLICK, 0.15),
}
