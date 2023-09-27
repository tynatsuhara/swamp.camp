import { AnonymousComponent, Entity, Point, PointValue, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Grid, Lists, RepeatedInvoker } from "brigsby/dist/util"
import { isGamePaused } from "../../core/PauseState"
import { TILE_DIMENSIONS, TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { Particles } from "../../graphics/particles/Particles"
import { Color } from "../../ui/Color"
import { adjacent } from "../../utils/misc"
import { now } from "../WorldTime"
import { GroundRenderer } from "../ground/GroundRenderer"

/**
 * @param width the ground tile width
 * @param height the ground tile height
 */
export const mineInteriorBackground = ({ pts }: { pts: PointValue[] }) => {
    const e = new Entity()

    const grid = new Grid<boolean>()
    pts.forEach((p) => grid.set(p, true))

    const tile = (p: Point, size = pt(1)) => {
        return Tilesets.instance.largeSprites.get({ position: pt(20, 0).plus(p), dimensions: size })
    }

    const wallSprites = [pt(0, 0), pt(2, 0), pt(4, 0)].map((p) => tile(p, pt(2)))
    const groundSprites = [pt(0, 2), pt(2, 2), pt(4, 2)].map((p) => tile(p, pt(2)))

    pts.forEach(({ x, y }) => {
        e.addComponent(
            Lists.oneOf(groundSprites).toComponent(
                SpriteTransform.new({
                    // each ground sprite is 2x2 designed to be overlapped as 1x1 tiles
                    position: pt(x - 0.5, y - 0.5).times(TILE_SIZE),
                    depth: GroundRenderer.DEPTH,
                    rotation: Lists.oneOf([0, 90, 180, 270]),
                    mirrorX: Math.random() > 2,
                })
            )
        )
    })

    // ladder
    e.addComponent(
        tile(pt(6, 0), pt(1, 3)).toComponent(
            SpriteTransform.new({
                position: pt(0, -2).times(TILE_SIZE),
                depth: GroundRenderer.DEPTH + 1,
            })
        )
    )

    const wallPts = pts.map((p) => pt(p.x, p.y - 1)).filter((p) => !grid.get(p))
    wallPts.forEach(({ x, y }) => {
        e.addComponent(
            Lists.oneOf(wallSprites).toComponent(
                SpriteTransform.new({
                    // each ground sprite is 2x2 designed to be overlapped as 1x1 tiles
                    position: pt(x - 0.5, y - 0.5).times(TILE_SIZE),
                    depth: GroundRenderer.DEPTH,
                    mirrorX: Math.random() > 2,
                })
            )
        )
    })

    const colliderGrid = new Grid<boolean>()
    pts.flatMap((p) => adjacent(p))
        .filter((p) => !grid.get(p))
        .forEach((p) => colliderGrid.set(p, true))

    colliderGrid.keys().forEach((p) => {
        e.addComponent(new BoxCollider(p.times(TILE_SIZE), TILE_DIMENSIONS))
    })

    let lastSpawnParticleTime = 0

    // Emit particles
    e.addComponent(
        new RepeatedInvoker(
            () => {
                lastSpawnParticleTime = now()
                return spawnParticle(pts)
            },
            0,
            isGamePaused
        )
    )

    e.addComponent(
        new AnonymousComponent({
            update: () => {
                // spawn a bunch when the player enters to make it consistent
                const shouldSpawnParticlesInBatch = now() - lastSpawnParticleTime > 1_500
                if (shouldSpawnParticlesInBatch) {
                    lastSpawnParticleTime = now()
                    for (let i = 0; i < 0.7 * pts.length; i++) {
                        spawnParticle(pts, Math.random() * 10_000)
                    }
                }
            },
        })
    )

    return e
}

const spawnParticle = (pts: PointValue[], lifetime = 10_000) => {
    const particleCountMultiplier = pts.length / 15
    const p = Lists.oneOf(pts)

    // create a particle
    const offset = pt(1)
        .apply((n) => Math.random() * n * TILE_SIZE)
        .plusY(-1.5 * TILE_SIZE) // align with top

    Particles.instance.emitParticle(
        Lists.oneOf([Color.BLACK, Color.TAUPE_1, Color.TAUPE_2]),
        pt(p.x * TILE_SIZE, p.y * TILE_SIZE).plus(offset),
        1_000_000_000,
        lifetime,
        (t) => pt(0, t * 0.004),
        pt(Math.random() > 0.5 ? 1 : 2)
    )

    return (500 + Math.random() * 500) / particleCountMultiplier
}
