import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Dude } from "../../Dude"
import { WeaponSpec } from "../MeleeWeapon"
import { WeaponSpriteCache } from "../WeaponSpriteCache"
import { MeleeAnimation } from "./MeleeAnimation"

export class BasicAttackAnimation extends MeleeAnimation {
    private timeElapsed = 0
    private readonly onFinish: () => void

    constructor(spec: WeaponSpec, onFinish: () => void) {
        super(spec)
        this.onFinish = onFinish
    }

    update(elapsedTimeMillis: number): void {
        this.timeElapsed += elapsedTimeMillis
        if (this.getAngle() >= 360) {
            this.onFinish()
        }
    }

    getFrame(
        dude: Dude,
        spriteCache: WeaponSpriteCache
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        return this.getFrameBase(dude, spriteCache, this.getAngle())
    }

    private getAngle() {
        const angle = Math.floor(this.timeElapsed / 0.85)
        return angle - (angle % 15)
    }
}
