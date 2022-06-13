import { UpdateData } from "brigsby/dist/Engine"
import { Point } from "brigsby/dist/Point"
import { RepeatedInvoker } from "brigsby/dist/util/RepeatedInvoker"
import { FireParticles } from "../../graphics/FireParticles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { here } from "../LocationManager"
import { WorldTime } from "../WorldTime"

const INTERVAL = 5_000
const TIME_UNTIL_DESTROY = 15_000

export class Burnable extends RepeatedInvoker {
    private pts: Point[]
    private burning: boolean
    private burnStart: number

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
                new FireParticles(8, () => {
                    return pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
                })
            )
        )
    }
}
