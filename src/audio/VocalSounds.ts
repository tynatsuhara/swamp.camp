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

import { Lists } from "brigsby/dist/util/Lists"
import { Dude } from "../characters/Dude"
import { DudeFaction } from "../characters/DudeFactory"
import { DudeType } from "../characters/DudeType"
import { loadAudio } from "./DeferLoadAudio"
import { Sounds } from "./Sounds"

const { range, oneOf } = Lists

const DEMON_SOUNDS = loadAudio(range(1, 16).map((i) => `audio/rpg/NPC/shade/shade${i}.wav`))
const ORC_SOUNDS = loadAudio(range(1, 6).map((i) => `audio/rpg/NPC/ogre/ogre${i}.wav`))
const SPOOKY_SOUNDS = loadAudio(range(1, 3).map((i) => `audio/m1/spooky_visitor_idle${i}.ogg`))
const MIMIC_SOUNDS = loadAudio(range(1, 3).map((i) => `audio/m1/mimic${i}.ogg`))
const AQUATIC_IDLE_SOUNDS = loadAudio(range(1, 5).map((i) => `audio/m1/aquatic_idle${i}.ogg`))
const AQUATIC_ACTIVE_SOUNDS = loadAudio(range(1, 4).map((i) => `audio/m1/aquatic_active${i}.ogg`))

const play = (
    d: Dude,
    sound: string,
    { volume = 0.2, chance = 1 }: { volume?: number; chance?: number } = {}
) => {
    if (Math.random() < chance) {
        Sounds.playAtPoint(sound, volume, d.standingPosition)
    }
}

const ambient = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, oneOf(ORC_SOUNDS))
    } else if (d.type === DudeType.SPOOKY_VISITOR) {
        play(d, oneOf(SPOOKY_SOUNDS), { volume: 1, chance: 0.2 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, oneOf(AQUATIC_IDLE_SOUNDS), { volume: 0.3 })
    }
}

const attack = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, oneOf(ORC_SOUNDS))
    } else if (d.type === DudeType.MIMIC) {
        play(d, oneOf(MIMIC_SOUNDS), { volume: 0.75 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, oneOf(AQUATIC_ACTIVE_SOUNDS), { volume: 1 })
    }
}

const damage = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, oneOf(ORC_SOUNDS))
    } else if (d.type === DudeType.SPOOKY_VISITOR) {
        play(d, oneOf(SPOOKY_SOUNDS), { volume: 1 })
    } else if (d.type === DudeType.SWAMP_THING) {
        play(d, oneOf(AQUATIC_ACTIVE_SOUNDS), { volume: 1 })
    }
}

export const VocalSounds = {
    ambient,
    attack,
    damage,
}
