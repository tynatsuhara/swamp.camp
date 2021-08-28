import { SpriteAnimation } from "brigsby/dist/sprites/SpriteAnimation"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { saveManager } from "../SaveManager"

const maybeFilter = (characterAnimName: string, blob: any, anim: SpriteAnimation) => {
    if (!anim) {
        throw new Error(`no animation found for "${characterAnimName}"`)
    }

    if (characterAnimName === "knight_f") {
        const color = blob.color || saveManager.getState().plume
        if (!!color) {
            return anim
                .filtered(ImageFilters.recolor(Color.PINK, color[0]))
                .filtered(ImageFilters.recolor(Color.LIGHT_PINK, color[1]))
        }
    }

    return anim
}

const getIdleAnimationSpeed = (characterAnimName: string) => {
    switch (characterAnimName) {
        case "Bear":
            return 180
        default:
            return 150
    }
}

const getWalkAnimationSpeed = (characterAnimName: string) => {
    switch (characterAnimName) {
        case "Bear":
            return 110
        default:
            return 80
    }
}

export const DudeAnimationUtils = {
    getCharacterIdleAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = getIdleAnimationSpeed(characterAnimName)
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed) 
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Idle`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Idle + Walk`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet2.getIdleAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = getWalkAnimationSpeed(characterAnimName)
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed) 
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Walk`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Idle + Walk`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet2.getWalkAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterJumpAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = 80
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_hit_anim`, animSpeed)
        // We only have/need this animation for the player
        if (!!anim) {
            return maybeFilter(characterAnimName, blob, anim)
        }
    },
}