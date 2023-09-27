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

    // const topLeft = pt(2, 1)
    // const topRight = pt(3, 1)
    // const bottomLeft = pt(2, 2)
    // const bottomRight = pt(3, 2)
    // const topSprites = Lists.range(0, 3).map((i) => pt(i + 1, 0))
    // const sideSprites = Lists.range(0, 7).map((i) => pt(0, i))
    // const center = Lists.range(0, 6).map((i) => pt(1, i + 1))

    // const dimensions = new Point(width, height + 1) // accomodate 1 tile wide walls

    // const { sprites } = NineSlice.makeNineSliceComponents(
    //     [
    //         () => tile(topLeft),
    //         () => tile(Lists.oneOf(topSprites)),
    //         () => tile(topRight),
    //         () => tile(Lists.oneOf(sideSprites)),
    //         () => tile(Lists.oneOf(center)),
    //         () => tile(Lists.oneOf(sideSprites)),
    //         () => tile(bottomLeft),
    //         () => tile(Lists.oneOf(sideSprites)),
    //         () => tile(bottomRight),
    //     ],
    //     dimensions,
    //     {
    //         position: pt(0, -TILE_SIZE + 3), // shift up a bit to accomodate walls
    //         depth: GroundRenderer.DEPTH,
    //     }
    // )
    // NineSlice.nineSliceForEach(dimensions, (pt, i) => {
    //     if (i === 5) {
    //         sprites.get(pt).transform.rotation = 180
    //     } else if (i === 7) {
    //         sprites.get(pt).transform.rotation = 270
    //     }
    // })

    // place the ladder
    // sprites.remove(pt(ladderIndex, 0))
    // e.addComponent(
    //     tile(pt(2, 3), pt(1, 3)).toComponent(
    //         SpriteTransform.new({
    //             position: pt(ladderIndex, -2).times(TILE_SIZE),
    //             depth: GroundRenderer.DEPTH + 1,
    //         })
    //     )
    // )

    // e.addComponents(sprites.values())

    return e
}
