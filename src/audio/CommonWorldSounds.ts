import { Point } from "brigsby/dist"
import { Lists } from "brigsby/dist/util"
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

export const CommonWorldSounds = {
    playFoliageRustling: (centerPos: Point, vol = 0.2) =>
        Sounds.playAtPoint(FOLIAGE_RUSTLING_SOUNDS.next(), vol, centerPos),

    playWoodChop: (centerPos: Point) => Sounds.playAtPoint(CHOPPING_AUDIO.next(), 0.3, centerPos),

    playMiningRock: (centerPos: Point) => Sounds.playAtPoint(MINING_AUDIO.next(), 0.4, centerPos),
}
