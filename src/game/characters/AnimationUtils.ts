import { Tilesets } from "../graphics/Tilesets"

export const AnimationUtils = {
    getCharacterIdleAnimation: (characterAnimName: string) => {
        const animSpeed = 150
        const idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed)
        if (!idleAnim) {
            return Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Idle`, animSpeed)
        }
        return idleAnim
    },

    getCharacterWalkAnimation: (characterAnimName: string) => {
        const animSpeed = 80
        const idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed)
        if (!idleAnim) {
            return Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Walk`, animSpeed)
        }
        return idleAnim
    },
}