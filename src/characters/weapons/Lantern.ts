import { Point, UpdateData } from "brigsby/dist"
import { StaticSpriteSource } from "brigsby/dist/sprites/StaticSpriteSource"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Item } from "../../items/Item"
import { LightManager } from "../../world/LightManager"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

/**
 * A lantern, which is really just a shield that can't block and emits light
 */
export class Lantern extends Shield {
    static readonly DIAMETER = 100
    private repeatedInvoker = new RepeatedInvoker(() => this.burn(500), 0)

    private onSprite: StaticSpriteSource
    private offSprite: StaticSpriteSource
    private fuel: number

    constructor() {
        super(ShieldType.LANTERN, "tool_lantern")
        const { awake } = this
        this.awake = (awakeData) => {
            awake(awakeData)
            this.onSprite = Tilesets.instance.dungeonCharacters.getTileSource("tool_lantern")
            this.offSprite = Tilesets.instance.dungeonCharacters.getTileSource("tool_lantern_off")
            this.burn(0) // update fuel state
            this.updateLight()
        }
    }

    update(updateData: UpdateData) {
        const dims = this.dude.animation.transform.dimensions
        this.transform.position = new Point(dims.x / 2, dims.y)
            .plus(this.dude.getOffsetRelativeToAnimation())
            .minus(new Point(0, 16))

        this.transform.depth = -0.5

        this.updateLight()

        this.repeatedInvoker.update(updateData)
    }

    simulate(duration: number): void {
        this.burn(duration)
    }

    private updateLight() {
        if (this.fuel > 0) {
            LightManager.instance.addLight(
                this.dude.location,
                this,
                this.dude.standingPosition
                    .plusY(-TILE_SIZE / 2)
                    .plus(this.dude.getAnimationOffset()),
                Lantern.DIAMETER
            )
        }
    }

    private burn(duration: number) {
        const [invStack, stackIndex] = this.dude.inventory.find(
            (s) => s?.item === Item.LANTERN && s?.metadata.equipped === "shield"
        )

        this.fuel = Math.max(invStack.metadata.fuel - duration, 0)
        this.dude.inventory.setStack(stackIndex, invStack.withMetadata({ fuel: this.fuel }))

        if (this.fuel > 0) {
            this.sprite = this.onSprite
        } else {
            this.sprite = this.offSprite
            this.removeLight()
        }

        return duration
    }

    delete() {
        this.removeLight()
        super.delete()
    }

    removeLight() {
        LightManager.instance.removeLight(this)
    }

    toggleOnBack() {}

    block() {}

    isBlocking() {
        return false
    }

    canAttack() {
        return true
    }
}
