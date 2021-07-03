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
import { GroundRenderer } from "../GroundRenderer"
import { PointAudio } from "../../audio/PointAudio"

const SPLASH_PARTICLE_LIFETIME = 1000
const SPLASH_PARTICLE_FREQUENCY = 100

export const makeWaterfall = (d: MakeGroundFuncData): GroundComponent => {
    const schema = new ConnectingTileWaterfallSchema()

    const e = new Entity([
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    const level = d.wl.levels.get(d.pos)
    let rotation: number
    if (d.wl.levels.get(d.pos.plusX(-1)) < level) {
        rotation = 90
    } else if (d.wl.levels.get(d.pos.plusY(-1)) < level) {
        rotation = 180
    } else if (d.wl.levels.get(d.pos.plusX(1)) < level) {
        rotation = 270
    } else {
        rotation = 0
    }

    const waterfallSpeed = 150
    e.addComponent(
        new TileSetAnimation([
            [Tilesets.instance.tilemap.getTileAt(new Point(1, 1)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(2, 1)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(1, 2)), waterfallSpeed],
            [Tilesets.instance.tilemap.getTileAt(new Point(2, 2)), waterfallSpeed],
        ]).toComponent(TileTransform.new({
            position: d.pos.times(TILE_SIZE),
            depth: GroundRenderer.DEPTH - 5,
            rotation,
        }))
    )

    // TODO: Multiple waterfalls can create a weird robotic sound when audio overlaps
    e.addComponent(
        new PointAudio(
            "/audio/ambiance/waterfall.wav",
            d.pos.plus(new Point(.5, .5)).times(TILE_SIZE),
            TILE_SIZE * 8,
            true,
            .1
        )
    )

    // TODO particles for different angle waterfalls
    e.addComponent(new RepeatedInvoker(
        () => {
            for (let i = 0; i < 5; i++) {
                const size = Math.floor(Math.random() * 3)
                Particles.instance.emitParticle(
                    Color.WHITE, 
                    d.pos.times(TILE_SIZE).plus(new Point(
                        Math.floor(Math.random() * TILE_SIZE-size),
                        12 + Math.random() * 2
                    )),
                    GroundRenderer.DEPTH - 1, 
                    SPLASH_PARTICLE_LIFETIME,
                    (t) => new Point(0, t * .005),
                    new Point(size, size),
                )
            }
            return SPLASH_PARTICLE_FREQUENCY
        }
    ))

    return e.addComponent(new GroundComponent(GroundType.WATERFALL))
}