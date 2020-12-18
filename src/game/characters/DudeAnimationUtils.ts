import { Tilesets } from "../graphics/Tilesets"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { ImageFilters } from "../graphics/ImageFilters"
import { Color } from "../ui/Color"
import { Lists } from "../../engine/util/Lists"

// array of [dark, light] pairs
const CUSTOMIZATION_OPTIONS = [
    [Color.DARK_DARK_PINK, Color.DARK_PINK],
    [Color.DARK_PINK, Color.PINK],
    [Color.PINK, Color.LIGHT_PINK],
    [Color.DARK_RED, Color.RED],
    [Color.DARK_ORANGE, Color.ORANGE],
    [Color.ORANGE, Color.LIGHT_ORANGE],
    [Color.GREEN, Color.LIME],
    [Color.DARK_GREEN, Color.GREEN],
    [Color.DARK_DARK_BLUE, Color.DARK_BLUE],
    [Color.DARK_BLUE, Color.LIGHT_BLUE],
    [Color.DARK_BLUE, Color.LIGHT_BLUE],
    [Color.TEAL, Color.BRIGHT_BLUE],
    [Color.DARK_PURPLE, Color.PURPLE],
    [Color.DARK_PINKLE, Color.PINKLE],
    [Color.PINKLE, Color.LIGHT_PINKLE],
    [Color.LIGHT_BROWN, Color.TAN],
    [Color.BROWN, Color.LIGHT_BROWN],
    [Color.DARK_BROWN, Color.BROWN],
]

// TODO make configurable
const SELECTED_USER_COLOR = Lists.oneOf(CUSTOMIZATION_OPTIONS);

const maybeFilter = (characterAnimName: string, anim: TileSetAnimation) => {
    if (characterAnimName === "knight_f") {
        return anim
                .filtered(ImageFilters.recolor(Color.PINK, SELECTED_USER_COLOR[0]))
                .filtered(ImageFilters.recolor(Color.LIGHT_PINK, SELECTED_USER_COLOR[1]))
    }

    return anim
}

export const DudeAnimationUtils = {
    getCharacterIdleAnimation: (characterAnimName: string) => {
        const animSpeed = 150
        let anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed)
        if (!anim) {
            anim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Idle`, 4, animSpeed)
        }
        return maybeFilter(characterAnimName, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string) => {
        const animSpeed = 80
        let anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed)
        if (!anim) {
            anim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Walk`, 4, animSpeed)
        }
        return maybeFilter(characterAnimName, anim)
    },
}