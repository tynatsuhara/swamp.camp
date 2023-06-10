import { assets } from "brigsby/dist"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player"
import { controls } from "../core/Controls"
import { GroundType } from "../world/ground/Ground"
import { here } from "../world/locations/LocationManager"
import { Sounds } from "./Sounds"

const FOOTSTEP_SOUND_DISTANCE = 160

export class StepSounds {
    private static readonly SPEED = 330

    private static readonly GRAVEL_SOUND = "audio/steps/gravel.ogg"
    private static readonly MUD_SOUND = "audio/steps/mud02.ogg"
    private static readonly STONE_SOUND = "audio/steps/stone01.ogg"
    private static readonly WOOD_SOUND = "audio/steps/wood01.ogg"
    private static readonly WATER_SOUNDS = Lists.range(1, 5).map(
        (i) => `audio/steps/wave_0${i}.flac`
    )
    private static readonly GRASS_SOUNDS = Lists.range(1, 3).map(
        (i) => `audio/steps/leaves0${i}.ogg`
    )

    static startFootstepSoundLoop = (dude: Dude) => {
        assets
            .loadAudioFiles([
                StepSounds.GRAVEL_SOUND,
                StepSounds.MUD_SOUND,
                StepSounds.STONE_SOUND,
                StepSounds.WOOD_SOUND,
                ...StepSounds.WATER_SOUNDS,
                ...StepSounds.GRASS_SOUNDS,
            ])
            .then(() =>
                dude.entity.addComponent(
                    new RepeatedInvoker(() => {
                        if (player()) {
                            if (dude?.isAlive && dude.isMoving && !dude.rolling && !dude.jumping) {
                                const [sound, volume] = StepSounds.getSound(dude)
                                if (!!sound) {
                                    Sounds.playAtPoint(sound, volume, dude.standingPosition)
                                }
                            }
                        }
                        return StepSounds.SPEED
                    })
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
                return [Lists.oneOf(StepSounds.GRASS_SOUNDS), 0.3]
            case GroundType.BASIC:
            case GroundType.BASIC_NINE_SLICE:
                return [StepSounds.WOOD_SOUND, 0.15]
            case GroundType.PATH:
                return [StepSounds.MUD_SOUND, 0.3]
            case GroundType.WATER:
            case GroundType.WATERFALL:
                if (dude === player()) {
                    controls.vibrate({
                        duration: 70,
                        strongMagnitude: 0,
                        weakMagnitude: 0.075,
                    })
                }
                return [Lists.oneOf(StepSounds.WATER_SOUNDS), 0.035]
            default:
                console.log("no mapped sound for ground type")
                return [undefined, 0]
        }
    }
}
