import { Component, Entity, Point, pt } from "brigsby/dist"
import { SpriteAnimation, SpriteTransform } from "brigsby/dist/sprites"
import { RepeatedInvoker } from "brigsby/dist/util"
import { PointAudio } from "../../audio/PointAudio"
import { isGamePaused } from "../../core/PauseState"
import { ImageFilters } from "../../graphics/ImageFilters"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Particles } from "../../graphics/particles/Particles"
import { Color } from "../../ui/Color"
import { ConnectingTile } from "./ConnectingTile"
import { ConnectingTileWaterfallSchema } from "./ConnectingTileWaterfallSchema"
import { GroundType, MakeGroundFuncData } from "./Ground"
import { GroundComponent } from "./GroundComponent"
import { GroundRenderer } from "./GroundRenderer"
import { WaterRenderer } from "./WaterRenderer"

const SPLASH_PARTICLE_LIFETIME = 1200
const SPLASH_PARTICLE_FREQUENCY = 100

export const makeWaterfall = (d: MakeGroundFuncData): GroundComponent => {
    const pixelPos = d.pos.times(TILE_SIZE)
    const schema = new ConnectingTileWaterfallSchema()

    const e = new Entity([new ConnectingTile(schema, d.wl, d.pos)])

    const level = d.wl.getLevel(d.pos)
    const flowSpeed = 0.004
    const sideParticleOffset = 5.5
    const sideWaterfallOffset = 3

    let spriteFilter = (img: ImageData) => img
    let waterfallOffset = Point.ZERO
    let waterSpriteDepth = GroundRenderer.DEPTH - 4
    let rotation: number
    let particlePosSupplier: (size: number) => Point
    let particleDirection: (t: number) => Point
    let pushDirection: Point

    if (d.wl.getLevel(d.pos.plusX(-1)) < level) {
        // flowing left
        pushDirection = pt(-1, 0)
        rotation = 90
        particlePosSupplier = (size) =>
            pixelPos.plus(
                pt(
                    sideParticleOffset + Math.random() * 2,
                    Math.floor(Math.random() * TILE_SIZE - size)
                )
            )
        particleDirection = (t) => pt(-t * flowSpeed, 0)
        waterfallOffset = pt(sideWaterfallOffset, 0)
    } else if (d.wl.getLevel(d.pos.plusX(1)) < level) {
        // flowing right
        pushDirection = pt(1, 0)
        rotation = 270
        particlePosSupplier = (size) =>
            pixelPos.plus(
                pt(
                    TILE_SIZE - sideParticleOffset - Math.random() * 2,
                    Math.floor(Math.random() * TILE_SIZE - size)
                )
            )
        particleDirection = (t) => pt(t * flowSpeed, 0)
        waterfallOffset = pt(-sideWaterfallOffset, 0)
    } else if (d.wl.getLevel(d.pos.plusY(-1)) < level) {
        // flowing up
        pushDirection = pt(0, -1)
        rotation = 180
        particlePosSupplier = (size) =>
            pixelPos.plus(pt(Math.floor(Math.random() * TILE_SIZE - size), 1 + Math.random() * 2))
        particleDirection = (t) => pt(0, -t * flowSpeed)
        waterSpriteDepth = ConnectingTileWaterfallSchema.DEPTH - 1
        const yOffset = 5
        waterfallOffset = pt(0, -yOffset + 1)
        spriteFilter = ImageFilters.segment((x, y) => y > TILE_SIZE - yOffset)
    } else {
        // flowing down
        pushDirection = pt(0, 1)
        rotation = 0
        particlePosSupplier = (size) =>
            pixelPos.plus(pt(Math.floor(Math.random() * TILE_SIZE - size), 12 + Math.random() * 2))
        particleDirection = (t) => pt(0, t * flowSpeed)
    }

    const waterfallSpeed = 150
    e.addComponent(
        new SpriteAnimation(
            [pt(1, 1), pt(2, 1), pt(1, 2), pt(2, 2)]
                .map((pt) => Tilesets.instance.tilemap.getTileAt(pt))
                .map((tile) => tile.filtered(spriteFilter))
                .map((tile) => [tile, waterfallSpeed]),
            () => {},
            isGamePaused
        ).toComponent(
            SpriteTransform.new({
                position: pixelPos.plus(waterfallOffset),
                depth: waterSpriteDepth,
                rotation,
            })
        )
    )

    WaterRenderer.instance.setWaterTile(d.wl, d.pos)

    e.addComponent(
        new PointAudio(
            "audio/ambiance/waterfall.wav",
            pixelPos.plus(pt(TILE_SIZE / 2, TILE_SIZE / 2)),
            TILE_SIZE * 8,
            0.2
        )
    )

    e.addComponent(
        new RepeatedInvoker(() => {
            for (let i = 0; i < 5; i++) {
                const size = Math.floor(Math.random() * 3)
                Particles.instance.emitParticle(
                    Color.WHITE,
                    particlePosSupplier(size),
                    GroundRenderer.DEPTH - 1,
                    SPLASH_PARTICLE_LIFETIME,
                    particleDirection,
                    pt(size, size)
                )
            }
            return SPLASH_PARTICLE_FREQUENCY
        })
    )

    e.addComponent(new Waterfall(pushDirection))

    return e.addComponent(new GroundComponent(GroundType.WATERFALL))
}

export class Waterfall extends Component {
    constructor(public readonly direction: Point) {
        super()
    }
}
