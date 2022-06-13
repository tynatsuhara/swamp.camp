import { Component } from "brigsby/dist/Component"
import { Point } from "brigsby/dist/Point"
import { FireParticles } from "../../graphics/FireParticles"
import { TILE_SIZE } from "../../graphics/Tilesets"

export class Burnable extends Component {
    private pts: Point[]
    private burning: boolean

    public get isBurning() {
        return this.burning
    }

    // private element: ElementComponent
    // private particles: FireParticles
    // private burning: boolean

    constructor(burning: boolean, pts: Point[]) {
        super()
        this.pts = pts
        if (burning) {
            this.burn()
        }
    }

    burn() {
        if (this.burning) {
            return
        }
        this.burning = true
        this.pts.forEach((pt) =>
            this.entity.addComponent(
                new FireParticles(8, () => {
                    return pt.plus(new Point(0.5, 0.5)).times(TILE_SIZE)
                })
            )
        )
    }
}
