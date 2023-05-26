import { assets } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "../audio/DeferLoadAudio"
import { Sounds } from "../audio/Sounds"

const SOUNDS = {
    CLICK: "audio/ui/switch22.ogg",
    ERROR_CLICK: "audio/rpg/interface/interface6.wav",
}

const CLINK_NOISES = loadAudio([
    "audio/rpg/inventory/coin.wav",
    "audio/rpg/inventory/coin2.wav",
    "audio/rpg/inventory/coin3.wav",
])

export const UISounds = {
    loadAll: () => assets.loadAudioFiles(Object.values(SOUNDS)),
    playClickSound: () => Sounds.play(SOUNDS.CLICK, 0.035),
    playErrorSound: () => Sounds.play(SOUNDS.ERROR_CLICK, 0.15),
    playMoneySound: () => Sounds.play(Lists.oneOf(CLINK_NOISES), 0.4),
}
