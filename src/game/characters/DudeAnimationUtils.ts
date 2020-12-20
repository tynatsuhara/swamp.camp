import { TileSetAnimation } from "../../engine/tiles/TileSetAnimation"
import { ImageFilters } from "../graphics/ImageFilters"
import { Tilesets } from "../graphics/Tilesets"
import { Color } from "../ui/Color"
import { saveManager } from "../SaveManager"

const maybeFilter = (characterAnimName: string, blob: object, anim: TileSetAnimation) => {
    if (characterAnimName === "knight_f") {
        const color = saveManager.getState().plume
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
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed) 
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Idle`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet2.getIdleAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },

    getCharacterWalkAnimation: (characterAnimName: string, blob: object): TileSetAnimation => {
        const animSpeed = 80
        const anim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed) 
                  || Tilesets.instance.extraCharacterSet1.getTileSetAnimation(`${characterAnimName}_Walk`, 4, animSpeed)
                  || Tilesets.instance.extraCharacterSet2.getWalkAnimation(characterAnimName, animSpeed)

        return maybeFilter(characterAnimName, blob, anim)
    },
}