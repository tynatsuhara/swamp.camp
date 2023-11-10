// faction sounds:
/* DudeFaction {
    VILLAGERS, // TODO (including player!)
    ORCS, // sounds: rpg/npc/ogre ✅
    UNDEAD, // TODO
    DEMONS, // sounds: rpg/npc/shade ✅
    SHROOMS, // sounds: lots of options in rpg/npc/* that could work here
    CENTAURS, // TODO
    GNOLLS + WOLVES, // TODO
    BEARS, // TODO
    AQUATIC, // right now this only includes the SWAMP_THING
} */

// special cases:
/* DudeType {
    PLAYER,
    SPOOKY_VISITOR, ✅
    GUMBALL,
    ONION,
    KNIGHT,
    FOREST_GUARDIAN,
    MIMIC, ✅
    SKELETON,
} */

import { Dude } from "../characters/Dude"
import { DudeFaction } from "../characters/DudeFactory"
import { DudeType } from "../characters/DudeType"
import { SoundPool } from "./SoundPool"
import { Sounds } from "./Sounds"

const DEMON_SOUNDS = SoundPool.range(15, "audio/rpg/NPC/shade/shade%%.wav")
const ORC_SOUNDS = SoundPool.range(5, "audio/rpg/NPC/ogre/ogre%%.wav")
const SPOOKY_SOUNDS = SoundPool.range(2, "audio/m1/spooky_visitor_idle%%.ogg")
const MIMIC_SOUNDS = SoundPool.range(4, "audio/m1/mimic%%.ogg")
const AQUATIC_IDLE_SOUNDS = SoundPool.range(4, "audio/m1/aquatic_idle%%.ogg")
const AQUATIC_ACTIVE_SOUNDS = SoundPool.range(3, "audio/m1/aquatic_active%%.ogg")

const play = (
    d: Dude,
    sounds: SoundPool,
    { volume = 0.2, chance = 1 }: { volume?: number; chance?: number } = {}
) => {
    if (Math.random() < chance) {
        Sounds.playAtPoint(sounds.next(), volume, d.standingPosition)
    }
}

const ambient = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, DEMON_SOUNDS)
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, ORC_SOUNDS)
    } else if (d.type === DudeType.SPOOKY_VISITOR) {
        play(d, SPOOKY_SOUNDS, { volume: 1, chance: 0.2 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, AQUATIC_IDLE_SOUNDS, { volume: 0.3 })
    }
}

const attack = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, DEMON_SOUNDS)
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, ORC_SOUNDS)
    } else if (d.type === DudeType.MIMIC) {
        play(d, MIMIC_SOUNDS, { volume: 0.75 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, AQUATIC_ACTIVE_SOUNDS, { volume: 1 })
    }
}

const damage = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, DEMON_SOUNDS)
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, ORC_SOUNDS)
    } else if (d.type === DudeType.SPOOKY_VISITOR) {
        play(d, SPOOKY_SOUNDS, { volume: 1 })
    } else if (d.type === DudeType.MIMIC) {
        play(d, MIMIC_SOUNDS, { volume: 0.75 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, AQUATIC_ACTIVE_SOUNDS, { volume: 1 })
    }
}

export const VocalSounds = {
    ambient,
    attack,
    damage,
}
