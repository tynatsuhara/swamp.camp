import { Point } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { session } from "../../online/session"
import { Hittable } from "./Hittable"

export class HittableResource extends Hittable {
    private static negativeThreshold = -4

    freeResources: number
    readonly maxResources: number
    private itemSupplier: () => Item[]
    private audioCallback: () => void
    private finishCallback: () => void

    constructor(
        position: Point,
        tileTransforms: SpriteTransform[],
        freeResources: number,
        maxResources: number,
        itemSupplier: () => Item[],
        audioCallback: () => void = () => {},
        finishCallback: () => void
    ) {
        super(position, tileTransforms, (hitDir) => this.hitCallback(hitDir))
        this.freeResources = freeResources
        this.maxResources = maxResources
        this.itemSupplier = itemSupplier
        this.audioCallback = audioCallback
        this.finishCallback = finishCallback
    }

    private hitCallback(hitDir: Point) {
        this.freeResources--
        this.audioCallback()

        if (this.freeResources < 0 && this.freeResources > HittableResource.negativeThreshold) {
            return
        }

        const finishingMove = this.freeResources < 0
        let velocityMultiplier = finishingMove ? 0.6 : 1
        let placeDistance = finishingMove ? 2 : 8
        let itemsOut = finishingMove ? 3 : 1

        if (session.isHost()) {
            for (let i = 0; i < itemsOut; i++) {
                const items = this.itemSupplier()
                for (const item of items) {
                    const itemDirection = hitDir.randomlyShifted(0.5).normalized()
                    const velocity = itemDirection.times(1 + 3 * Math.random())
                    spawnItem({
                        pos: this.position
                            .plus(new Point(0, TILE_SIZE / 2))
                            .plus(itemDirection.times(placeDistance)), // bottom center, then randomly adjusted
                        item,
                        velocity: velocity.times(velocityMultiplier),
                        sourceCollider: this.entity.getComponent(BoxCollider),
                    })
                }
            }
        }

        if (finishingMove) {
            this.finishCallback()
            this.entity.selfDestruct()
        }
    }

    replenish() {
        if (!!this.entity && this.enabled) {
            this.freeResources = Maths.clamp(this.freeResources + 1, 1, this.maxResources)
        }
    }
}
