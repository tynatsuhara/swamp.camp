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
import { getAnimatedWaterTileComponent } from "./Water"
import { ImageFilters } from "../../graphics/ImageFilters"

const SPLASH_PARTICLE_LIFETIME = 1000
const SPLASH_PARTICLE_FREQUENCY = 100

export const makeWaterfall = (d: MakeGroundFuncData): GroundComponent => {
    const pixelPos = d.pos.times(TILE_SIZE)
    const schema = new ConnectingTileWaterfallSchema()

    const e = new Entity([
        new ConnectingTile(schema, d.wl, d.pos)
    ])

    const level = d.wl.levels.get(d.pos)
    const flowSpeed = .005
    const sideParticleOffset = 5
    const sideWaterfallOffset = 3

    let spriteFilter = (img: ImageData) => img
    let waterfallOffset = Point.ZERO
    let waterSpriteDepth = GroundRenderer.DEPTH - 4
    let rotation: number
    let particlePosSupplier: (size: number) => Point
    let particleDirection: (t: number) => Point
    
    if (d.wl.levels.get(d.pos.plusX(-1)) < level) {
        // flowing left
        rotation = 90
        particlePosSupplier = (size) => pixelPos.plus(new Point(
            sideParticleOffset + Math.random() * 2,
            Math.floor(Math.random() * TILE_SIZE-size)
        ))
        particleDirection = (t) => new Point(-t * flowSpeed, 0)
        waterfallOffset = new Point(sideWaterfallOffset, 0)
    } else if (d.wl.levels.get(d.pos.plusX(1)) < level) {
        // flowing right
        rotation = 270
        particlePosSupplier = (size) => pixelPos.plus(new Point(
            TILE_SIZE - sideParticleOffset - Math.random() * 2,
            Math.floor(Math.random() * TILE_SIZE-size)
        ))
        particleDirection = (t) => new Point(t * flowSpeed, 0)
        waterfallOffset = new Point(-sideWaterfallOffset, 0)
    } else if (d.wl.levels.get(d.pos.plusY(-1)) < level) {
        // flowing up
        rotation = 180
        particlePosSupplier = (size) => pixelPos.plus(new Point(
            Math.floor(Math.random() * TILE_SIZE-size),
            1 + Math.random() * 2
        ))
        particleDirection = (t) => new Point(0, -t * flowSpeed)
        waterSpriteDepth = ConnectingTileWaterfallSchema.DEPTH - 1
        const yOffset = 5
        waterfallOffset = new Point(0, -yOffset+1)
        spriteFilter = ImageFilters.segment((x, y) => y > TILE_SIZE-yOffset)
    } else {
        // flowing down
        rotation = 0
        particlePosSupplier = (size) => pixelPos.plus(new Point(
            Math.floor(Math.random() * TILE_SIZE-size),
            12 + Math.random() * 2
        ))
        particleDirection = (t) => new Point(0, t * flowSpeed)
    }

    const waterfallSpeed = 150
    e.addComponent(
        new TileSetAnimation(
            [new Point(1, 1), new Point(2, 1), new Point(1, 2), new Point(2, 2)]
                    .map(pt => Tilesets.instance.tilemap.getTileAt(pt))
                    .map(tile => tile.filtered(spriteFilter))
                    .map(tile => [tile, waterfallSpeed])
        ).toComponent(TileTransform.new({
            position: pixelPos.plus(waterfallOffset),
            depth: waterSpriteDepth,
            rotation,
        }))
    )

    e.addComponent(getAnimatedWaterTileComponent(d.pos))

    // TODO: Multiple waterfalls can create a weird robotic sound when audio overlaps
    e.addComponent(
        new PointAudio(
            "/audio/ambiance/waterfall.wav",
            pixelPos.plus(new Point(TILE_SIZE/2, TILE_SIZE/2)),
            TILE_SIZE * 8,
            true,
            .1
        )
    )

    e.addComponent(new RepeatedInvoker(
        () => {
            for (let i = 0; i < 5; i++) {
                const size = Math.floor(Math.random() * 3)
                Particles.instance.emitParticle(
                    Color.WHITE, 
                    particlePosSupplier(size),
                    GroundRenderer.DEPTH - 1, 
                    SPLASH_PARTICLE_LIFETIME,
                    particleDirection,
                    new Point(size, size),
                )
            }
            return SPLASH_PARTICLE_FREQUENCY
        }
    ))

    return e.addComponent(new GroundComponent(GroundType.WATERFALL))
}