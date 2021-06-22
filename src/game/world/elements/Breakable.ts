import { BoxCollider } from "../../../engine/collision/BoxCollider"
import { UpdateData } from "../../../engine/Engine"
import { Point } from "../../../engine/Point"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { Hittable } from "./Hittable"

/**
 * Very similar to HittableResource, but more for the purpose
 * of picking up furniture than for collecting resources.
 * 
 * TODO: Make this use the item recipe instead of manually specifying what drops.
 */
export class Breakable extends Hittable {

    private itemSupplier: () => Item[]    
    private audioCallback: () => void

    private score = 0  // increases on each hit, decreases with time
    private static readonly HIT_SCORE_INCREASE = 1000
    private static readonly BREAK_THRESHOLD = 1800

    constructor(
        position: Point, 
        tileTransforms: TileTransform[], 
        itemSupplier: () => Item[],
        audioCallback: () => void = () => {}
    ) {
        super(position, tileTransforms, hitDir => this.hitCallback(hitDir))
        this.itemSupplier = itemSupplier
        this.audioCallback = audioCallback
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

        const items = this.itemSupplier()
        for (const item of items) {
            const itemDirection = hitDir.randomlyShifted(.5).normalized()
            const velocity = itemDirection.times(1 + 3 * Math.random())
            spawnItem(
                this.position.plus(new Point(0, TILE_SIZE/2)),
                item, 
                velocity,
                this.entity.getComponent(BoxCollider)
            )
        }

        this.entity.selfDestruct()
    }
}