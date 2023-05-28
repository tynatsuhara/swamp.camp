import { AnonymousComponent, Entity, Point, pt } from "brigsby/dist"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Particles } from "../../graphics/particles/Particles"
import { Color } from "../../ui/Color"
import { WorldTime } from "../WorldTime"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/ElementType"
import { Interactable } from "../elements/Interactable"
import { Location } from "../locations/Location"
import { LocationManager } from "../locations/LocationManager"

export class MineExitFactory extends ElementFactory<ElementType.MINE_EXIT> {
    readonly dimensions = pt(1, 1)

    constructor() {
        super(ElementType.MINE_EXIT)
    }

    make(wl: Location, pos: Point, data: any) {
        const e = new Entity()

        const interactPos = Point.fromString(data.i)

        let spawnParticlesAtTime = Number.MAX_SAFE_INTEGER
        let particleCountMultiplier = 1
        let spawnParticle: (lifetime?: number) => number = () => 0

        e.addComponent(
            new AnonymousComponent({
                start: () => {
                    const mineData = wl.getFeatureOfType("mineInteriorBackground")
                    const mineDimensions = pt(mineData.width, mineData.height)

                    spawnParticlesAtTime = 0
                    particleCountMultiplier = (mineDimensions.x * mineDimensions.y) / 15

                    spawnParticle = (lifetime = 10_000) => {
                        // create a particle
                        const pos = mineDimensions
                            .apply((n) => Math.random() * n * TILE_SIZE)
                            .plusY(-1.5 * TILE_SIZE) // align with top
                        Particles.instance.emitParticle(
                            Lists.oneOf([Color.BLACK, Color.TAUPE_1, Color.TAUPE_2]),
                            pos,
                            1_000_000_000,
                            lifetime,
                            (t) => pt(0, t * 0.004),
                            pt(Math.random() > 0.5 ? 1 : 2)
                        )

                        return (500 + Math.random() * 500) / particleCountMultiplier
                    }

                    e.addComponent(new RepeatedInvoker(() => spawnParticle()))
                },
                update: () => {
                    if (WorldTime.instance.time > spawnParticlesAtTime) {
                        for (let i = 0; i < 10 * particleCountMultiplier; i++) {
                            spawnParticle(Math.random() * 10_000)
                        }
                        spawnParticlesAtTime = Number.MAX_SAFE_INTEGER
                    }
                },
            })
        )

        e.addComponent(
            new Interactable(
                interactPos,
                () => {
                    LocationManager.instance.playerUseTeleporter(wl.uuid) // the teleporter ID should match the mine interior's UUID
                    spawnParticlesAtTime = WorldTime.instance.time + 1_000
                },
                pt(0, -TILE_SIZE)
            )
        )

        return e.addComponent(new ElementComponent(ElementType.MINE_EXIT, pos, () => data))
    }
}
