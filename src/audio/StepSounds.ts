import { assets } from "brigsby/dist/Assets"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Dude } from "../characters/Dude"
import { DudeType } from "../characters/DudeFactory"
import { Player } from "../characters/Player"
import { controls } from "../Controls"
import { GroundType } from "../world/ground/Ground"
import { here } from "../world/LocationManager"
import { Sounds } from "./Sounds"

const FOOTSTEP_SOUND_DISTANCE = 160

export class StepSounds {
    private static readonly SPEED = 330
    private static readonly GRAVEL = "audio/steps/gravel.ogg"
    private static readonly LEAVES_1 = "audio/steps/leaves01.ogg"
    private static readonly LEAVES_2 = "audio/steps/leaves02.ogg"
    private static readonly MUD = "audio/steps/mud02.ogg"
    private static readonly STONE = "audio/steps/stone01.ogg"
    private static readonly WOOD_1 = "audio/steps/wood01.ogg"
    private static readonly WOOD_2 = "audio/steps/wood02.ogg"
    private static readonly WOOD_3 = "audio/steps/wood03.ogg"
    private static readonly WATER_1 = "audio/steps/wave_01.flac"
    private static readonly WATER_2 = "audio/steps/wave_02.flac"
    private static readonly WATER_3 = "audio/steps/wave_03.flac"
    private static readonly WATER_4 = "audio/steps/wave_04.flac"

    static startFootstepSoundLoop = (dude: Dude) => {
        assets
            .loadAudioFiles([
                StepSounds.GRAVEL,
                StepSounds.LEAVES_1,
                StepSounds.LEAVES_2,
                StepSounds.MUD,
                StepSounds.STONE,
                StepSounds.WOOD_1,
                StepSounds.WOOD_2,
                StepSounds.WOOD_3,
                StepSounds.WATER_1,
                StepSounds.WATER_2,
                StepSounds.WATER_3,
                StepSounds.WATER_4,
            ])
            .then(() =>
                dude.entity.addComponent(
                    new RepeatedInvoker(() => {
                        const player = Player.instance.dude
                        if (player) {
                            const distance = player.standingPosition.manhattanDistanceTo(
                                dude.standingPosition
                            )
                            if (
                                dude?.isAlive &&
                                dude.isMoving &&
                                !dude.rolling &&
                                !dude.jumping &&
                                distance <= FOOTSTEP_SOUND_DISTANCE
                            ) {
                                const vol = Math.max(
                                    0,
                                    (FOOTSTEP_SOUND_DISTANCE - distance) / FOOTSTEP_SOUND_DISTANCE
                                )
                                StepSounds.singleFootstepSound(dude, vol)
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
            Sounds.play(sound, volume * volumeMultiplier)
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
                return Lists.oneOf([
                    [StepSounds.LEAVES_1, 0.3],
                    [StepSounds.LEAVES_2, 0.3],
                ])
            case GroundType.BASIC:
            case GroundType.BASIC_NINE_SLICE:
                return [StepSounds.WOOD_1, 0.15]
            case GroundType.PATH:
                return [StepSounds.MUD, 0.3]
            case GroundType.WATER:
            case GroundType.WATERFALL:
                if (dude.type === DudeType.PLAYER) {
                    controls.vibrate({
                        duration: 70,
                        strongMagnitude: 0,
                        weakMagnitude: 0.075,
                    })
                }
                const waterVolume = 0.035
                return Lists.oneOf([
                    [StepSounds.WATER_1, waterVolume],
                    [StepSounds.WATER_2, waterVolume],
                    [StepSounds.WATER_3, waterVolume],
                    [StepSounds.WATER_4, waterVolume],
                ])
            default:
                console.log("no mapped sound for ground type")
                return [undefined, 0]
        }
    }
}
