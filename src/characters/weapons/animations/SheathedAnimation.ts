import { pt } from "brigsby/dist/Point"
import { Dude } from "../../Dude"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

export class SheathedAnimation extends MeleeAnimation {
    getFrame(dude: Dude, spriteCache: WeaponSpriteCache) {
        const { sprite, transform } = this.getFrameBase(dude, spriteCache, 0, pt(3, -1))
        transform.mirrorY = true
        transform.depth = -0.5
        return [{ sprite, transform }]
    }
}
