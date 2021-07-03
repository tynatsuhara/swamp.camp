import { assets } from "../../engine/Assets"
import { Lists } from "../../engine/util/Lists"
import { Player } from "../characters/Player"
import { pixelPtToTilePt } from "../graphics/Tilesets"
import { Settings } from "../Settings"
import { GroundType } from "../world/ground/Ground"
import { LocationManager } from "../world/LocationManager"

export class StepSounds {

    private static footstep: HTMLAudioElement

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

    static startFootstepSoundLoop = () => {
        assets.loadAudioFiles([ 
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
        ]).then(() => StepSounds.doFootstep())
    }
    
    static singleFootstepSound(volumeMultiplier: number) {
        const [sound, volume] = StepSounds.getSound()
        if (!!sound) {
            // TODO: We could probably make this a bit less laggy by pre-loading
            StepSounds.footstep = assets.getAudioByFileName(sound)
            StepSounds.footstep.oncanplaythrough = () => {
                StepSounds.footstep.play()
                StepSounds.footstep.volume = Math.min(1, volume * volumeMultiplier * Settings.getSoundVolume())
            }
        }
    }

    private static doFootstep = () => {
        const dude = Player.instance.dude
        setTimeout(() => {
            if (dude?.isAlive && dude.isMoving && !dude.rolling()) {
                StepSounds.singleFootstepSound(1)
            }
            StepSounds.doFootstep()
        }, StepSounds.SPEED);
    }

    private static getSound = (): [string, number] => {
        const ground = LocationManager.instance.currentLocation.ground.get(pixelPtToTilePt(Player.instance.dude.standingPosition))
        if (!ground) {
            return [undefined, 0]
        }
        switch(ground.type) {
            case GroundType.GRASS:
            case GroundType.LEDGE:
                return Lists.oneOf([
                    [StepSounds.LEAVES_1, .3],
                    [StepSounds.LEAVES_2, .3],
                ])
            case GroundType.BASIC:
            case GroundType.BASIC_NINE_SLICE:
                return [StepSounds.WOOD_1, .15]
            case GroundType.PATH:
                return [StepSounds.MUD, .3]
            case GroundType.WATER:
            case GroundType.WATERFALL:
                const waterVolume = .035
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