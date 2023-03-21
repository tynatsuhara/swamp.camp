import { Point } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Maths } from "brigsby/dist/util"
import { Dude } from "../../characters/Dude"
import { DudeType } from "../../characters/DudeType"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Item, spawnItem } from "../../items/Items"
import { session } from "../../online/session"
import { Hittable } from "./Hittable"

export class HittableResource extends Hittable {
    private static negativeThreshold = -4

    availableResources: number
    readonly maxResources: number
    private itemSupplier: (hitter: Dude) => Item[]
    private audioCallback: () => void
    private finishCallback: () => void

    constructor(
        position: Point,
        tileTransforms: SpriteTransform[],
        availableResources: number,
        maxResources: number,
        itemSupplier: (hitter: Dude) => Item[],
        audioCallback: () => void = () => {},
        finishCallback: () => void
    ) {
        super(position, tileTransforms, (hitDir, dude) => this.hitCallback(hitDir, dude))
        this.availableResources = availableResources
        this.maxResources = maxResources
        this.itemSupplier = itemSupplier
        this.audioCallback = audioCallback
        this.finishCallback = finishCallback
    }

    private hitCallback(hitDir: Point, dude: Dude) {
        this.audioCallback()

        // NPCs take longer to chop trees because they're weak
        const resourceHitImpact = dude.type === DudeType.PLAYER ? 1 : 0.2
        this.availableResources -= resourceHitImpact

        if (
            this.availableResources < 0 &&
            this.availableResources > HittableResource.negativeThreshold
        ) {
            return
        }

        const finishingMove = this.availableResources < 0
        let velocityMultiplier = finishingMove ? 0.6 : 1
        let placeDistance = finishingMove ? 2 : 8
        let itemsOut = finishingMove ? 3 : 1

        if (session.isHost() && dude.type === DudeType.PLAYER) {
            for (let i = 0; i < itemsOut; i++) {
                const items = this.itemSupplier(dude)
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
            if (session.isHost()) {
                this.entity.selfDestruct()
            }
        }
    }

    replenish() {
        if (!!this.entity && this.enabled) {
            this.availableResources = Maths.clamp(this.availableResources + 1, 1, this.maxResources)
        }
    }
}
