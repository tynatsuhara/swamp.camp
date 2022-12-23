import { Point, pt } from "brigsby/dist/Point"
import { SpriteTransform } from "brigsby/dist/sprites/SpriteTransform"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { Dude } from "../../Dude"
import { WeaponSpec } from "../MeleeWeapon"
import { WeaponSpriteCache } from "../WeaponSpriteCache"

export type AnimationArgs = {
    dude: Dude
    spec: WeaponSpec
    spriteCache: WeaponSpriteCache
}

export abstract class MeleeAnimation {
    readonly dude: Dude
    readonly spec: WeaponSpec
    readonly spriteCache: WeaponSpriteCache

    constructor({ dude, spec, spriteCache }: AnimationArgs) {
        this.dude = dude
        this.spec = spec
        this.spriteCache = spriteCache
    }

    update(elapsedTimeMillis: number): void {}

    abstract getFrame(): { sprite: StaticSpriteSource; transform: SpriteTransform }[]

    /**
     * @returns a frame positioned based on the sprite cache configuration
     */
    protected getFrameBase(
        angle: number,
        offset: Point = Point.ZERO
    ): { sprite: StaticSpriteSource; transform: SpriteTransform } {
        const { sprite, position } = this.spriteCache.get(angle)
        const transform = SpriteTransform.new({
            position: pt(
                this.dude.animation.sprite.dimensions.x / 2,
                this.dude.animation.sprite.dimensions.y
            )
                .plus(position)
                .plus(this.spec.offsetFromCenter)
                .plus(offset)
                .plus(this.dude.getOffsetRelativeToAnimation())
                .apply(Math.round),
            // .minus(pt(sprite.dimensions.x / 2, sprite.dimensions.y)),
            dimensions: sprite.dimensions,
        }).relativeTo(this.dude.animation.transform)
        return { sprite, transform }
    }
}
