import { Tilesets } from "../graphics/Tilesets"

export const AnimationUtils = {
    getCharacterIdleAnimation: (characterAnimName: string) => {
        const animSpeed = 150
        let idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_idle_anim`, animSpeed)
        if (!idleAnim) {
            idleAnim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Idle`, 4, animSpeed)
        }
        return idleAnim
    },

    getCharacterWalkAnimation: (characterAnimName: string) => {
        const animSpeed = 80
        let idleAnim = Tilesets.instance.dungeonCharacters.getTileSetAnimation(`${characterAnimName}_run_anim`, animSpeed)
        if (!idleAnim) {
            idleAnim = Tilesets.instance.otherCharacters.getTileSetAnimation(`${characterAnimName}_Walk`, 4, animSpeed)
        }
        return idleAnim
    },
}