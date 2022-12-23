import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Dude } from "../../Dude"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

export class IdleAnimation extends MeleeAnimation {
    getFrame(
        dude: Dude,
        spriteCache: WeaponSpriteCache
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        return this.getFrameBase(dude, spriteCache, 0)
    }
}
