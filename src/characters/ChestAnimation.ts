import { SpriteAnimation } from "brigsby/dist/sprites"
import { Tilesets } from "../graphics/Tilesets"

type ChestVariant = "empty" | "full" | "mimic"

const OPEN_FRAME_DURATION = 80
const CLOSE_FRAME_DURATION = 20

const getSprites = (variant: ChestVariant) =>
    Tilesets.instance.dungeonCharacters.getTileSetAnimationFrames(`chest_${variant}_open_anim`)

const open = (variant: ChestVariant, onFinish?: () => void) => {
    const sprites = getSprites(variant)
    return new SpriteAnimation(
        [
            [sprites[0], OPEN_FRAME_DURATION],
            [sprites[1], OPEN_FRAME_DURATION],
            [sprites[2], OPEN_FRAME_DURATION],
        ],
        onFinish
    )
}

const close = (variant: ChestVariant, onFinish?: () => void) => {
    const sprites = getSprites(variant)
    return new SpriteAnimation(
        [
            [sprites[2], CLOSE_FRAME_DURATION],
            [sprites[1], CLOSE_FRAME_DURATION],
            [sprites[0], CLOSE_FRAME_DURATION],
        ],
        onFinish
    )
}

export const ChestAnimation = { open, close }
