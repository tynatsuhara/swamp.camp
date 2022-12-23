import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Dude } from "../../Dude"
import { WeaponSpec } from "../MeleeWeapon"
import { WeaponSpriteCache } from "../WeaponSpriteCache"

export abstract class MeleeAnimation {
    readonly spec: WeaponSpec

    constructor(spec: WeaponSpec) {
        this.spec = spec
    }

    update(elapsedTimeMillis: number): void {}

    abstract getFrame(
        dude: Dude,
        spriteCache: WeaponSpriteCache
    ): { sprite: StaticSpriteSource; transform: SpriteTransform }

    /**
     * @returns a frame positioned based on the sprite cache configuration
     */
    protected getFrameBase(
        dude: Dude,
        spriteCache: WeaponSpriteCache,
        angle: number,
        offset: Point = Point.ZERO
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        const { sprite, position } = spriteCache.get(angle)
        const transform = SpriteTransform.new({
            position: pt(dude.animation.sprite.dimensions.x / 2, dude.animation.sprite.dimensions.y)
                .plus(position)
                .plus(this.spec.offsetFromCenter)
                .plus(offset)
                .plus(dude.getOffsetRelativeToAnimation())
                .apply(Math.round),
            // .minus(pt(sprite.dimensions.x / 2, sprite.dimensions.y)),
            dimensions: sprite.dimensions,
        }).relativeTo(dude.animation.transform)
        return { sprite, transform }
    }
}
