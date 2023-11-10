import { SoundPool } from "../audio/SoundPool"
import { Sounds } from "../audio/Sounds"

const SOUNDS = {
    CLICK: "audio/ui/switch22.ogg",
    ERROR_CLICK: "audio/rpg/interface/interface6.wav",
}

const CLINK_NOISES = new SoundPool([
    "audio/rpg/inventory/coin.wav",
    "audio/rpg/inventory/coin2.wav",
    "audio/rpg/inventory/coin3.wav",
])

export const UISounds = {
    playClickSound: () => Sounds.play(SOUNDS.CLICK, 0.035),
    playErrorSound: () => Sounds.play(SOUNDS.ERROR_CLICK, 0.15),
    playMoneySound: () => Sounds.play(CLINK_NOISES.next(), 0.4),
}
