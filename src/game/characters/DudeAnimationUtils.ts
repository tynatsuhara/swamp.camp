import { Tilesets } from "../graphics/Tilesets"
import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { ImageFilters } from "../graphics/ImageFilters"
import { Color } from "../ui/Color"
import { Lists } from "../../engine/util/Lists"

// array of [dark, light] pairs
// TODO move this
export const CUSTOMIZATION_OPTIONS = [
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

const maybeFilter = (characterAnimName: string, blob: object, anim: TileSetAnimation) => {
    if (characterAnimName === "knight_f") {
        const color = blob["color"]
        if (!!color) {
            return anim
                .filtered(ImageFilters.recolor(Color.PINK, color[0]))
                .filtered(ImageFilters.recolor(Color.LIGHT_PINK, color[1]))
        }
    }

    return anim
}

export const DudeAnimationUtils = {
    getCharacterIdleAnimation: (characterAnimName: string, blob: object): TileSetAnimation => {
        const animSpeed = 150
        let anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed)
        if (!anim) {
            anim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Idle`, 4, animSpeed)
        }
        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string, blob: object): TileSetAnimation => {
        const animSpeed = 80
        let anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed)
        if (!anim) {
            anim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Walk`, 4, animSpeed)
        }
        return maybeFilter(characterAnimName, blob, anim)
    },
}