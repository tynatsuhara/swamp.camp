import { Dude } from "../../Dude"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

export class IdleAnimation extends MeleeAnimation {
    getFrame(dude: Dude, spriteCache: WeaponSpriteCache) {
        return [this.getFrameBase(dude, spriteCache, 0)]
    }
}
