import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { Lists } from "brigsby/dist/util/Lists"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { FireParticles } from "../../graphics/FireParticles"
import { Particles } from "../../graphics/Particles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { here } from "../LocationManager"
import { WorldTime } from "../WorldTime"

const INTERVAL = 5_000
const TIME_UNTIL_DESTROY = 15_000

export class Burnable extends RepeatedInvoker {
    private pts: Point[]
    private burning: boolean
    private burnStart: number
    private depth: number

    public get isBurning() {
        return this.burning
    }

    constructor(initialBurning: boolean, pts: Point[]) {
        super(() => {
            if (!this.burning) {
                return INTERVAL
            }
            this.pts.forEach((pt) => {
                const adjacent = [pt.plusX(1), pt.plusX(-1), pt.plusY(1), pt.plusY(-1)]
                adjacent.forEach((adj) => {
                    here().getElement(adj)?.entity.getComponent(Burnable)?.burn()
                })
            })
            return INTERVAL
        }, INTERVAL)

        this.pts = pts
        this.depth = Math.max(...pts.map((pt) => pt.y + 1)) * TILE_SIZE

        if (initialBurning) {
            this.burn()
        }
    }

    update(updateData: UpdateData) {
        super.update(updateData)

        if (WorldTime.instance.time - this.burnStart > TIME_UNTIL_DESTROY) {
            this.entity.selfDestruct()
        }
    }

    burn() {
        if (this.burning) {
            return
        }
        this.burning = true
        this.burnStart = WorldTime.instance.time
        this.pts.forEach((pt) =>
            this.entity.addComponent(
                new FireParticles(
                    8,
                    () => {
                        return pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
                    },
                    () => this.depth
                )
            )
        )
    }

    delete() {
        this.pts.forEach((pos) => {
            const position = pos.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
            for (let i = 0; i < 20; i++) {
                const speed = Math.random() > 0.5 ? 0.003 : 0.001
                Particles.instance.emitParticle(
                    Lists.oneOf([Color.TAUPE_2, Color.TAUPE_1, Color.BLACK, Color.BLACK]),
                    position.randomCircularShift(8).plusY(-4),
                    (pos.y + 1) * TILE_SIZE,
                    500 + Math.random() * 500,
                    (t) => new Point(0, t * speed),
                    Math.random() > 0.5 ? new Point(2, 2) : new Point(1, 1)
                )
            }
        })
        super.delete()
    }
}
