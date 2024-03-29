import { RepeatedInvoker } from "brigsby/dist/util"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { isGamePaused } from "../core/PauseState"
import { GroundType } from "../world/ground/Ground"
import { here } from "../world/locations/LocationManager"
import { loadAudio } from "./DeferLoadAudio"
import { SoundPool } from "./SoundPool"
import { Sounds } from "./Sounds"

const MUD_SOUND = "audio/steps/mud02.ogg"
const STONE_SOUND = "audio/steps/stone01.ogg"
const WOOD_SOUND = "audio/steps/wood01.ogg"
const WATER_SOUNDS = SoundPool.range(4, "audio/steps/wave_0%%.flac")
const GRASS_SOUNDS = SoundPool.range(2, "audio/steps/leaves0%%.ogg")

loadAudio([MUD_SOUND, STONE_SOUND, WOOD_SOUND])

export class StepSounds {
    private static readonly SPEED = 330

    static startFootstepSoundLoop = (dude: Dude) => {
        dude.entity.addComponent(
            new RepeatedInvoker(
                () => {
                    if (player()) {
                        if (dude?.isAlive && dude.isMoving && !dude.rolling && !dude.jumping) {
                            const [sound, volume] = StepSounds.getSound(dude)
                            if (!!sound) {
                                Sounds.playAtPoint(sound, volume, dude.standingPosition)
                            }
                        }
                    }
                    return StepSounds.SPEED
                },
                0,
                isGamePaused
            )
        )
    }

    static singleFootstepSound(dude: Dude, volumeMultiplier: number) {
        const [sound, volume] = StepSounds.getSound(dude)
        if (!!sound) {
            Sounds.playAtPoint(sound, volume * volumeMultiplier, dude.standingPosition)
        }
    }

    private static getSound = (dude: Dude): [string, number] => {
        const ground = here().getGround(dude.tile)
        if (!ground) {
            return [undefined, 0]
        }
        switch (ground.type) {
            case GroundType.GRASS:
            case GroundType.LEDGE:
                return [GRASS_SOUNDS.next(), 0.3]
            case GroundType.BASIC:
            case GroundType.BASIC_NINE_SLICE:
                return [WOOD_SOUND, 0.15]
            case GroundType.PATH:
                return [MUD_SOUND, 0.3]
            case GroundType.WATER:
            case GroundType.WATERFALL:
                if (dude === player()) {
                    controls.vibrate({
                        duration: 70,
                        strongMagnitude: 0,
                        weakMagnitude: 0.075,
                    })
                }
                return [WATER_SOUNDS.next(), 0.035]
            default:
                console.log("no mapped sound for ground type")
                return [undefined, 0]
        }
    }
}
