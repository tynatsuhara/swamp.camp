import { Entity, Point, pt } from "brigsby/dist"
import { Lists, RepeatedInvoker } from "brigsby/dist/util"
import { Particles } from "../../graphics/particles/Particles"
import { TILE_SIZE } from "../../graphics/Tilesets"
import { Color } from "../../ui/Color"
import { ElementComponent } from "../elements/ElementComponent"
import { ElementFactory } from "../elements/ElementFactory"
import { ElementType } from "../elements/Elements"
import { Interactable } from "../elements/Interactable"
import { Location } from "../locations/Location"

export class MineExitFactory extends ElementFactory<ElementType.MINE_EXIT> {
    readonly dimensions = new Point(1, 1)

    constructor() {
        super(ElementType.MINE_EXIT)
    }

    make(wl: Location, pos: Point, data: any) {
        const e = new Entity()

        const destinationUUID = data.to
        const i = data.i // the position for the interactable
        if (!destinationUUID || !i) {
            throw new Error("teleporter element must have 'to' and 'i' parameters")
        }
        const interactPos = Point.fromString(i)
        const id = data.id

        e.addComponent(
            new Interactable(
                interactPos,
                () => wl.playerUseTeleporter(destinationUUID, id),
                new Point(0, -TILE_SIZE)
            )
        )

        // TODO: pre-populate the area so particles are present when entered
        e.addComponent(
            new RepeatedInvoker(() => {
                // create a particle
                const pos = new Point(5, 3)
                    .apply((n) => Math.random() * n * TILE_SIZE)
                    .plusY(-2 * TILE_SIZE) // align with top
                Particles.instance.emitParticle(
                    Lists.oneOf([Color.BLACK, Color.TAUPE_1, Color.TAUPE_2]),
                    pos,
                    1_000_000_000,
                    10_000,
                    (t) => pt(0, t * 0.004),
                    pt(Math.random() > 0.5 ? 1 : 2)
                )

                return 500 + Math.random() * 500
            })
        )

        return e.addComponent(new ElementComponent(ElementType.MINE_EXIT, pos, () => data))
    }
}
