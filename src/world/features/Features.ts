import { Entity, Point, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { NineSlice, SpriteTransform } from "brigsby/dist/sprites"
import { Lists } from "brigsby/dist/util"
import { TILE_SIZE, Tilesets } from "../../graphics/Tilesets"
import { TentColor, getTentVariantImageFilter } from "../../items/TentVariants"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { GroundRenderer } from "../ground/GroundRenderer"
import { Location } from "../locations/Location"

// Features are non-grid aligned aspects of a location.
// These functions should take a single serializable object argument.
const FEATURES = {
    sprite: ({
        key,
        pixelX,
        pixelY,
        rotation = 0,
        depth = 0,
    }: {
        key: string
        pixelX: number
        pixelY: number
        rotation?: number
        depth?: number
    }) => {
        const tile = Tilesets.instance.getBasicTileSource(key)
        return new Entity([
            new BasicRenderComponent(
                tile.toImageRender(
                    SpriteTransform.new({
                        position: pt(pixelX, pixelY),
                        rotation,
                        depth,
                    })
                )
            ),
        ])
    },
    barrier: ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
        return new Entity([new BoxCollider(pt(x, y), pt(width, height))])
    },
    navMeshCollider: (
        {
            x,
            y,
            width,
            height,
        }: {
            x: number
            y: number
            width: number
            height: number
        },
        location: Location
    ) => {
        return new Entity([new NavMeshCollider(location, pt(x, y), pt(width, height))])
    },
    tentInteriorSprite: ({ color }: { color: TentColor }) => {
        const render = Tilesets.instance.largeSprites
            .getTileSource("tent-interior")
            .filtered(getTentVariantImageFilter(color))
            .toImageRender(
                SpriteTransform.new({
                    position: pt(0, -TILE_SIZE * 3),
                    depth: Number.MIN_SAFE_INTEGER,
                })
            )
        return new Entity([new BasicRenderComponent(render)])
    },
    /**
     * @param width the ground tile width
     * @param height the ground tile height
     */
    mineInteriorBackground: ({
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
            return Tilesets.instance.largeSprites.get(pt(24, 0).plus(p), size)
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
    },
}

export type FeatureType = keyof typeof FEATURES
export type FeatureData<F extends FeatureType> = Parameters<typeof FEATURES[F]>[0]

export type Feature<F extends FeatureType> = {
    type: F
    data: FeatureData<F>
}

export const instantiateFeature = <F extends FeatureType>(
    type: F,
    data: FeatureData<F>,
    location: Location
): Entity => {
    // @ts-ignore
    return FEATURES[type](data, location)
}
