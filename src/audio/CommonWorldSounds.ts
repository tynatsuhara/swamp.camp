import { Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
import { SoundPool } from "./SoundPool"
import { Sounds } from "./Sounds"

const CHOPPING_AUDIO = new SoundPool(
    Lists.range(0, 5).map((n) => `audio/impact/impactPlank_medium_00${n}.ogg`)
)
const CHOPPING_AUDIO_VOLUME = 0.3

const FOLIAGE_RUSTLING_SOUNDS = new SoundPool([
    ...Lists.range(1, 10).map((i) => `audio/nature/Footstep/FootstepGrass0${i}.wav`),
    ...Lists.range(1, 6).map((i) => `audio/nature/Foliage/Foliage0${i}.wav`),
])

export const CommonWorldSounds = {
    playFoliageRustling: (centerPos: Point, vol = 0.2) =>
        Sounds.playAtPoint(FOLIAGE_RUSTLING_SOUNDS.next(), vol, centerPos),

    playWoodChop: (centerPos: Point) =>
        Sounds.playAtPoint(CHOPPING_AUDIO.next(), CHOPPING_AUDIO_VOLUME, centerPos),
}
