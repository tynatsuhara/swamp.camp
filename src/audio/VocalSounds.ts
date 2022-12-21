/* DudeFaction {
    VILLAGERS,
    CLERGY,
    ORCS, // sounds: rpg/npc/ogre
    UNDEAD,
    DEMONS, // sounds: rpg/npc/shade
    SHROOMS, // sounds: lots of options in rpg/npc/* that could work here
    CENTAURS,
    GNOLLS,
    BEARS,
    WOLVES, // sounds: gumball
    AQUATIC, // sounds: lots of options in rpg/npc/* that could work here
} */

import { Lists } from "brigsby/dist/util/Lists"
import { Dude } from "../characters/Dude"
import { DudeFaction } from "../characters/DudeFactory"
import { loadAudio } from "./DeferLoadAudio"
import { Sounds } from "./Sounds"

const DEMON_SOUNDS = loadAudio(Lists.range(1, 16).map((i) => `audio/rpg/NPC/shade/shade${i}.wav`))
const ORC_SOUNDS = loadAudio(Lists.range(1, 6).map((i) => `audio/rpg/NPC/ogre/ogre${i}.wav`))

const play = (d: Dude, sound: string, volume: number = 0.2) => {
    Sounds.playAtPoint(sound, volume, d.standingPosition)
}

const ambient = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, Lists.oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, Lists.oneOf(ORC_SOUNDS))
    }
}

const attack = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, Lists.oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, Lists.oneOf(ORC_SOUNDS))
    }
}

const damage = (d: Dude) => {
    if (d.factions.includes(DudeFaction.DEMONS)) {
        play(d, Lists.oneOf(DEMON_SOUNDS))
    } else if (d.factions.includes(DudeFaction.ORCS)) {
        play(d, Lists.oneOf(ORC_SOUNDS))
    }
}

export const VocalSounds = {
    ambient,
    attack,
    damage,
}
