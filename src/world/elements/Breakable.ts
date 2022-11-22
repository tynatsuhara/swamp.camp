import { Point, UpdateData } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteTransform } from "brigsby/dist/sprites"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item, ItemMetadata, spawnItem } from "../../items/Items"
import { session } from "../../online/session"
import { Hittable } from "./Hittable"

/**
 * Very similar to HittableResource, but more for the purpose
 * of picking up furniture than for collecting resources.
 *
 * TODO: Make this use the item recipe instead of manually specifying what drops.
 */
export class Breakable extends Hittable {
    private itemSupplier: () => { item: Item; metadata?: ItemMetadata }[]
    private audioCallback: () => void

    private score = 0 // increases on each hit, decreases with time
    private static readonly HIT_SCORE_INCREASE = 1000
    private static readonly BREAK_THRESHOLD = 1800

    constructor(
        position: Point,
        tileTransforms: SpriteTransform[],
        itemSupplier: () => { item: Item; metadata?: ItemMetadata }[],
        audioCallback: () => void = () => {},
        extraRange: number = 0
    ) {
        super(position, tileTransforms, (hitDir) => this.hitCallback(hitDir))
        this.itemSupplier = itemSupplier
        this.audioCallback = audioCallback
        this.extraRange = extraRange
    }

    update(updateData: UpdateData) {
        super.update(updateData)

        this.score = Math.max(0, this.score - updateData.elapsedTimeMillis)
    }

    private hitCallback(hitDir: Point) {
        this.audioCallback()

        this.score += Breakable.HIT_SCORE_INCREASE
        if (this.score < Breakable.BREAK_THRESHOLD) {
            return
        }

        if (session.isHost()) {
            const items = this.itemSupplier()
            for (const { item, metadata } of items) {
                const itemDirection = hitDir.randomlyShifted(0.5).normalized()
                const velocity = itemDirection.times(1 + 3 * Math.random())
                spawnItem({
                    pos: this.position.plus(new Point(0, TILE_SIZE / 2)),
                    item,
                    velocity,
                    sourceCollider: this.entity.getComponent(BoxCollider),
                    metadata,
                })
            }
        }

        this.entity.selfDestruct()
    }
}
