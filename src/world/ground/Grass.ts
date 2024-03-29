import { Component, Entity, Point } from "brigsby/dist"
import { SpriteTransform, StaticSpriteSource } from "brigsby/dist/sprites"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"
import { GroundRenderer } from "./GroundRenderer"

const INDEX = "i"
const TALL_GRASS_COUNT = "t"

export const makeGrass = (d: MakeGroundFuncData): GroundComponent => {
    let tile: StaticSpriteSource
    const index = d.data[INDEX] ?? (Math.random() < 0.65 ? Math.floor(Math.random() * 4) : 0)
    let tallGrass = d.data[TALL_GRASS_COUNT] ?? (Math.random() < 0.05 ? 1 : 0)
    if (d.wl.isOccupied(d.pos)) {
        tallGrass = 0
    }

    if (index > 0) {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, index))
    } else {
        tile = Tilesets.instance.tilemap.getTileAt(new Point(0, 7))
    }

    GroundRenderer.instance.setTile(d.wl, d.pos, tile)

    const e = new Entity()

    for (let i = 0; i < tallGrass; i++) {
        e.addComponent(new TallGrass(d.pos))
    }

    return e.addComponent(
        new GroundComponent(
            GroundType.GRASS,
            () => ({
                [INDEX]: index,
                [TALL_GRASS_COUNT]: tallGrass,
            }),
            tallGrass === 0 // don't call update() or getRenderMethods() unless we have tall grass
        )
    )
}

class TallGrass extends Component {
    constructor(tilePos: Point) {
        super()

        const offset = new Point(
            -6 + Math.round(Math.random() * 11),
            -TILE_SIZE + 2 + Math.round(Math.random() * (TILE_SIZE - 2))
        )
        const grassPos = tilePos.times(TILE_SIZE).plus(offset)

        const isFlower = Math.random() < 0.1
        const tileKey = isFlower
            ? `flower${Math.ceil(Math.random() * 2)}`
            : `grass${Math.ceil(Math.random() * 2)}`

        const render = Tilesets.instance.outdoorTiles
            .getTileSource(tileKey)
            .toImageRender(
                new SpriteTransform(
                    grassPos,
                    null,
                    0,
                    Math.random() > 0.5,
                    false,
                    grassPos.y + TILE_SIZE
                )
            )

        this.getRenderMethods = () => [render]
    }
}
