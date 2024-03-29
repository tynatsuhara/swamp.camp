import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"

type AngleSpriteCache = Record<number, { sprite: StaticSpriteSource; position: Point }>

export class WeaponSpriteCache {
    private readonly cache: AngleSpriteCache = {}
    private readonly baseSprite: StaticSpriteSource
    private readonly ogCenter: Point
    private readonly rotationPoint: Point

    /**
     * @param rotationPoint the point (from the top left of the sprite around which it will rotate)
     */
    constructor(baseSprite: StaticSpriteSource, rotationPoint: Point) {
        this.cache[0] = {
            sprite: baseSprite,
            position: Point.ZERO,
        }
        this.baseSprite = baseSprite
        this.ogCenter = baseSprite.dimensions.floorDiv(2)
        this.rotationPoint = rotationPoint
    }

    get(angle: number) {
        // normalize angle
        angle = angle % 360
        if (angle < 0) {
            angle += 360
        }
        if (!this.cache[angle]) {
            const rotatedSprite = this.baseSprite.rotated(angle, "canvas")
            const centerAfterRotation = this.ogCenter.rotatedAround(this.rotationPoint, angle)
            // TODO: persist this cache in the browser
            this.cache[angle] = {
                sprite: rotatedSprite,
                position: centerAfterRotation.minus(rotatedSprite.dimensions.floorDiv(2)),
            }
        }

        return this.cache[angle]
    }
}
