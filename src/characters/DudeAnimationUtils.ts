import { SpriteAnimation } from "brigsby/dist/sprites"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { saveManager } from "../SaveManager"
import { Color } from "../ui/Color"
import { PLUME_COLORS } from "../ui/PlumePicker"

const maybeFilter = (characterAnimName: string, blob: any, anim: SpriteAnimation) => {
    if (!anim) {
        throw new Error(`no animation found for "${characterAnimName}"`)
    }

    if (characterAnimName === "knight_f") {
        const colorIndex = blob.color ?? saveManager.getState().plumeIndex ?? 0
        const color = PLUME_COLORS[colorIndex]
        if (!!color) {
            return anim.filtered(
                ImageFilters.recolor([Color.PINK_2, color[0]], [Color.PINK_3, color[1]])
            )
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
        const anim =
            Tilesets.instance.dungeonCharacters.getTileSetAnimation(
                `${characterAnimName}_idle_anim`,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle`,
                4,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle + Walk`,
                4,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet2.getIdleAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = getWalkAnimationSpeed(characterAnimName)
        const anim =
            Tilesets.instance.dungeonCharacters.getTileSetAnimation(
                `${characterAnimName}_run_anim`,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Walk`,
                4,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle + Walk`,
                4,
                animSpeed
            ) ||
            Tilesets.instance.extraCharacterSet2.getWalkAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterJumpAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = 80
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(
            `${characterAnimName}_hit_anim`,
            animSpeed
        )
        // We only have/need this animation for the player
        if (!!anim) {
            return maybeFilter(characterAnimName, blob, anim)
        }
    },
}
