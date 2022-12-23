import { Point } from "brigsby/dist/Point"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"

export type AngleSpriteCache = Record<number, { sprite: StaticSpriteSource; position: Point }>

export class WeaponSpriteCache {
    private readonly cache: AngleSpriteCache = {}
    private readonly baseSprite: StaticSpriteSource
    private readonly ogCenter: Point
    private readonly rotationPoint: Point

    constructor(baseSprite: StaticSpriteSource, baseSpritePosition: Point, rotationPoint: Point) {
        this.cache[0] = {
            sprite: baseSprite,
            position: baseSpritePosition,
        }
        this.baseSprite = baseSprite
        this.ogCenter = baseSpritePosition.plus(baseSprite.dimensions.floorDiv(2))
        this.rotationPoint = rotationPoint
    }

    get(angle: number) {
        if (!this.cache[angle]) {
            const rotatedSprite = this.baseSprite.rotated(angle)
            const centerAfterRotation = this.ogCenter.rotatedAround(this.rotationPoint, angle)
            this.cache[angle] = {
                sprite: rotatedSprite,
                position: centerAfterRotation.minus(rotatedSprite.dimensions.floorDiv(2)),
            }
        }

        return this.cache[angle]
    }
}
