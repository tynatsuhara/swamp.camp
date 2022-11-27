import { Point } from "brigsby/dist"
import { PointAudio } from "../../audio/PointAudio"
import { FireParticles } from "../../graphics/particles/FireParticles"
import { pixelPtToTilePt, TILE_SIZE } from "../../graphics/Tilesets"
import { Burnable } from "../../world/elements/Burnable"
import { LightManager } from "../../world/LightManager"
import { here } from "../../world/locations/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { Shield } from "./Shield"
import { ShieldType } from "./ShieldType"

const BLOB_ATTRIBUTE = "torch-start"
const LIFESPAN_MILLIS = TimeUnit.MINUTE * 30
const DIAMETERS = [40, 60, 80]

/**
 * A torch, which is a short-lived lantern that can be used to burn shit
 */
export class Torch extends Shield {
    static readonly DIAMETERS = DIAMETERS

    private particles: FireParticles
    private audio: PointAudio
    private burning = false

    constructor() {
        super(ShieldType.TORCH, "tool_torch")
    }

    start() {
        if (!this.dude.blob[BLOB_ATTRIBUTE]) {
            this.dude.blob[BLOB_ATTRIBUTE] = WorldTime.instance.time
        }

        this.particles = this.entity.addComponent(
            new FireParticles(
                3,
                () => this.transform.position.plus(new Point(2, 5)),
                () => this.transform.depth + 0.1
            )
        )

        this.audio = this.entity.addComponent(
            new PointAudio("audio/ambiance/campfire.ogg", this.dude.standingPosition, TILE_SIZE)
        )
    }

    update() {
        this.transform.rotation = 0
        this.transform.depth = -0.5
        const dims = this.dude.animation.transform.dimensions

        let newPos = new Point(dims.x / 2, dims.y)
            .plus(this.dude.getOffsetRelativeToAnimation())
            .minus(new Point(-4, 18))

        if (this.burning) {
            this.transform.rotation = 90
            newPos = newPos.plus(new Point(5, 5))
        }

        this.transform.position = newPos

        const now = WorldTime.instance.time
        const fireStart = this.dude.blob[BLOB_ATTRIBUTE]

        if (now > fireStart + LIFESPAN_MILLIS) {
            this.dude.equipFirstShieldInInventory()
            return
        }

        // one-based index of the DIAMETERS array
        const size =
            DIAMETERS.length - Math.floor((DIAMETERS.length * (now - fireStart)) / LIFESPAN_MILLIS)
        this.particles.size = size
        const diameter = DIAMETERS[size - 1]

        LightManager.instance.addLight(
            here(),
            this,
            this.dude.standingPosition.plusY(-TILE_SIZE / 2).plus(this.dude.getAnimationOffset()),
            diameter
        )

        this.audio.position = this.dude.standingPosition
        this.audio.multiplier = (1 / (DIAMETERS.length - size + 1)) * 0.6
    }

    delete() {
        this.dude.blob[BLOB_ATTRIBUTE] = undefined
        this.particles.delete()
        this.audio.delete()
        this.removeLight()
        super.delete()
    }

    removeLight() {
        LightManager.instance.removeLight(this)
    }

    toggleOnBack() {}

    block(blockingActive: boolean) {
        this.burning = blockingActive

        if (blockingActive) {
            const pt = pixelPtToTilePt(this.dude.standingPosition.plusY(-4)).plusX(
                this.dude.getFacingMultiplier()
            )
            here().getElement(pt)?.entity.getComponent(Burnable)?.burn(pt)
        }
    }

    isBlocking() {
        return false
    }

    canAttack() {
        return true
    }
}
