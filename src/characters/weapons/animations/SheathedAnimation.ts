import { pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Dude } from "../../Dude"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

export class SheathedAnimation extends MeleeAnimation {
    getFrame(
        dude: Dude,
        spriteCache: WeaponSpriteCache
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        const { sprite, transform } = this.getFrameBase(dude, spriteCache, 0, pt(3, -1))
        transform.mirrorY = true
        transform.depth = -0.5
        return { sprite, transform }
    }
}
