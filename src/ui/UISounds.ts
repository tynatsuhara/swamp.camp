import { assets } from "brigsby/dist/Assets"
import { Sounds } from "../audio/Sounds"

const CLICK_SOUND = "audio/ui/switch22.ogg"

export const UISounds = {
    loadAll: () => assets.loadAudioFiles([CLICK_SOUND]),
    playClickSound: () => Sounds.play(CLICK_SOUND, 0.035),
}
