import { SpriteAnimation } from "brigsby/dist/sprites"
import { saveManager } from "../core/SaveManager"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { PLUME_COLORS } from "../ui/PlumePicker"
import { ChestAnimation } from "./ChestAnimation"

const skinAndHairFilter = (blob: any) => {
    const skinColors = [
        Color.BROWN_1,
        Color.BROWN_2,
        Color.BROWN_3,
        Color.BROWN_4,
        Color.BROWN_5,
        Color.BROWN_6,
    ]
    const hairColors = [Color.BLACK, Color.TAUPE_1, Color.TAUPE_2, Color.TAUPE_3]

    const defaultSkin = Color.BROWN_4
    const defaultSkinShadow = Color.BROWN_3
    const defaultHair = Color.TAUPE_2
    const defaultHairShadow = Color.TAUPE_1

    // side effect (it's easier to do it here than in the factory)
    blob.skinIndex ??= Math.ceil(Math.random() * (skinColors.length - 1))
    blob.hairIndex ??= Math.ceil(Math.random() * (hairColors.length - 1))

    return ImageFilters.recolor(
        [defaultSkin, skinColors[blob.skinIndex]],
        [defaultSkinShadow, skinColors[blob.skinIndex - 1]],
        [defaultHair, hairColors[blob.hairIndex]],
        [defaultHairShadow, hairColors[blob.hairIndex - 1]]
    )
}

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
    } else if (characterAnimName.startsWith("prisoner")) {
        return anim.filtered(skinAndHairFilter(blob))
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
        let anim: SpriteAnimation

        if (characterAnimName.startsWith("chest_")) {
            anim = ChestAnimation.closed()
        }

        anim ??=
            Tilesets.instance.dungeonCharacters.getTileSetAnimation(
                `${characterAnimName}_idle_anim`,
                animSpeed
            ) ??
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle`,
                4,
                animSpeed
            ) ??
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle + Walk`,
                4,
                animSpeed
            ) ??
            Tilesets.instance.extraCharacterSet2.getIdleAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string, blob: object = {}): SpriteAnimation => {
        const animSpeed = getWalkAnimationSpeed(characterAnimName)
        let anim: SpriteAnimation

        if (characterAnimName.startsWith("chest_")) {
            anim = ChestAnimation.mimic()
        }

        anim ??=
            Tilesets.instance.dungeonCharacters.getTileSetAnimation(
                `${characterAnimName}_run_anim`,
                animSpeed
            ) ??
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Walk`,
                4,
                animSpeed
            ) ??
            Tilesets.instance.extraCharacterSet1.getTileSetAnimation(
                `${characterAnimName}_Idle + Walk`,
                4,
                animSpeed
            ) ??
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
