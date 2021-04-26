import { assets } from "../../engine/Assets"
import { Lists } from "../../engine/util/Lists"
import { Player } from "../characters/Player"
import { pixelPtToTilePt } from "../graphics/Tilesets"
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

    static startFootstepSoundLoop = () => {
        assets.loadAudioFiles([ 
            StepSounds.GRAVEL, 
            StepSounds.LEAVES_1, 
            StepSounds.LEAVES_2, 
            StepSounds.MUD, 
            StepSounds.STONE, 
            StepSounds.WOOD_1, 
            StepSounds.WOOD_2, 
            StepSounds.WOOD_3 
        ]).then(() => StepSounds.doFootstep())
    }
    
    static singleFootstepSound(volumeMultiplier: number) {
        const [sound, volume] = StepSounds.getSound()
        if (!!sound) {
            StepSounds.footstep = assets.getAudioByFileName(sound)
            StepSounds.footstep.oncanplay = () => {
                StepSounds.footstep.play()
                StepSounds.footstep.volume = Math.min(1, volume * volumeMultiplier)
            }
        }
    }

    private static doFootstep = () => {
        setTimeout(() => {
            if (Player.instance.dude.isMoving && !Player.instance.dude.rolling()) {
                StepSounds.singleFootstepSound(1)
            }
            StepSounds.doFootstep()
        }, StepSounds.SPEED);
    }

    private static getSound = (): [string, number] => {
        const ground = LocationManager.instance.currentLocation.ground.get(pixelPtToTilePt(Player.instance.dude.standingPosition))
        switch(ground.type) {
            case GroundType.GRASS:
            case GroundType.LEDGE:
                return Lists.oneOf([
                    [StepSounds.LEAVES_1, .2],
                    [StepSounds.LEAVES_2, .2],
                ])
            case GroundType.BASIC:
            case GroundType.BASIC_NINE_SLICE:
                return [StepSounds.WOOD_1, .1]
            case GroundType.PATH:
                return [StepSounds.GRAVEL, .2]
            default:
                console.log("no mapped sound for ground type")
                return [undefined, 0]
        }
    }
}