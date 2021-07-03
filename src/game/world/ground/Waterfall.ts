import { GroundComponent } from "./GroundComponent"
import { Entity } from "../../../engine/Entity"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { ConnectingTile } from "./ConnectingTile"
import { TileTransform } from "../../../engine/tiles/TileTransform"
import { Tilesets, TILE_SIZE } from "../../graphics/Tilesets"
import { Point } from "../../../engine/Point"
import { TileSetAnimation } from "../../../engine/tiles/TileSetAnimation"
import { ConnectingTileWaterfallSchema } from "./ConnectingTileWaterfallSchema"
import { RepeatedInvoker } from "../../../engine/util/RepeatedInvoker"
import { Particles } from "../../graphics/Particles"
import { Color } from "../../ui/Color"
import { ConnectingTileWaterSchema } from "./ConnectingTileWaterSchema"

export const makeWaterfall = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileWaterfallSchema()

    const e = new Entity([
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    const waterfallSpeed = 150
    e.addComponent(
        new TileSetAnimation([
            [Tilesets.instance.tilemap.getTileAt(new Point(1, 1)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(2, 1)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(3, 1)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(1, 2)), waterfallSpeed],
        ]).toComponent(TileTransform.new({
            position: d.pos.times(TILE_SIZE),
            depth: ConnectingTileWaterfallSchema.DEPTH - 1,
        }))
    )

    e.addComponent(new RepeatedInvoker(
        () => {
            for (let i = 0; i < 5; i++) {
                const size = Math.floor(Math.random() * 3)
                Particles.instance.emitParticle(
                    Color.WHITE, 
                    d.pos.times(TILE_SIZE).plus(new Point(
                        Math.floor(Math.random() * TILE_SIZE-size),
                        13 + Math.random() * 2
                    )),
                    Number.MIN_SAFE_INTEGER + .5, 
                    1000,
                    (t) => new Point(0, t * .005),
                    new Point(size, size),
                )
            }
            return 100
        }
    ))

    return e.addComponent(new GroundComponent(GroundType.WATERFALL))
}