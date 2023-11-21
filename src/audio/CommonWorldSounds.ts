import { Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { loadAudio } from "./DeferLoadAudio"
import { SoundPool } from "./SoundPool"
import { Sounds } from "./Sounds"

const FOLIAGE_RUSTLING_SOUNDS = new SoundPool([
    ...Lists.range(1, 10).map((i) => `audio/nature/Footstep/FootstepGrass0${i}.wav`),
    ...Lists.range(1, 6).map((i) => `audio/nature/Foliage/Foliage0${i}.wav`),
])
const CHOPPING_AUDIO = new SoundPool(
    Lists.range(0, 5).map((n) => `audio/impact/impactPlank_medium_00${n}.ogg`)
)
const MINING_AUDIO = new SoundPool(
    Lists.range(0, 5).map((n) => `audio/impact/impactMining_00${n}.ogg`)
)
const EAT_SOUND = "audio/rpg/NPC/beetle/bite-small.wav"
const DRINK_SOUND = "audio/rpg/inventory/bottle.wav"
loadAudio([EAT_SOUND, DRINK_SOUND])

export const CommonWorldSounds = {
    playFoliageRustling: (centerPos: Point, vol = 0.2) =>
        Sounds.playAtPoint(FOLIAGE_RUSTLING_SOUNDS.next(), vol, centerPos),

    playWoodChop: (centerPos: Point) => Sounds.playAtPoint(CHOPPING_AUDIO.next(), 0.3, centerPos),

    playMiningRock: (centerPos: Point) => Sounds.playAtPoint(MINING_AUDIO.next(), 0.4, centerPos),

    playEatSound: () => Sounds.play(EAT_SOUND, 0.3),

    playDrinkSound: () => Sounds.play(DRINK_SOUND, 0.2),
}
