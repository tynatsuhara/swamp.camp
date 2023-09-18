import { Entity, Point, pt } from "brigsby/dist"
import { NineSlice, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { GroundRenderer } from "../ground/GroundRenderer"

// TODO: Eventually we can make it so this isn't square-only by using layered sprites, but it's very low priority
/**
 * @param width the ground tile width
 * @param height the ground tile height
 */
export const mineInteriorBackground = ({
    width,
    height,
    ladderIndex,
}: {
    width: number
    height: number
    ladderIndex: number
}) => {
    const e = new Entity()

    const tile = (p: Point, size = pt(1)) => {
        return Tilesets.instance.largeSprites.get({ position: pt(24, 0).plus(p), dimensions: size })
    }

    const topLeft = pt(2, 1)
    const topRight = pt(3, 1)
    const bottomLeft = pt(2, 2)
    const bottomRight = pt(3, 2)
    const topSprites = Lists.range(0, 3).map((i) => pt(i + 1, 0))
    const sideSprites = Lists.range(0, 7).map((i) => pt(0, i))
    const center = Lists.range(0, 6).map((i) => pt(1, i + 1))

    const dimensions = new Point(width, height + 1) // accomodate 1 tile wide walls

    const { sprites } = NineSlice.makeNineSliceComponents(
        [
            () => tile(topLeft),
            () => tile(Lists.oneOf(topSprites)),
            () => tile(topRight),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(Lists.oneOf(center)),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(bottomLeft),
            () => tile(Lists.oneOf(sideSprites)),
            () => tile(bottomRight),
        ],
        dimensions,
        {
            position: pt(0, -TILE_SIZE + 3), // shift up a bit to accomodate walls
            depth: GroundRenderer.DEPTH,
        }
    )
    NineSlice.nineSliceForEach(dimensions, (pt, i) => {
        if (i === 5) {
            sprites.get(pt).transform.rotation = 180
        } else if (i === 7) {
            sprites.get(pt).transform.rotation = 270
        }
    })

    // place the ladder
    sprites.remove(pt(ladderIndex, 0))
    e.addComponent(
        tile(pt(2, 3), pt(1, 3)).toComponent(
            SpriteTransform.new({
                position: pt(ladderIndex, -2).times(TILE_SIZE),
                depth: GroundRenderer.DEPTH + 1,
            })
        )
    )

    e.addComponents(sprites.values())

    return e
}
