import { Entity, Point, PointValue, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Grid, Lists } from "brigsby/dist/util"
import { TILE_DIMENSIONS, TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { adjacent } from "../../utils/misc"
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

    return e
}
