import { Entity, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"

// Features are non-grid aligned aspects of a location.
// These functions should take a single serializable object argument.
const Features = {
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
        // TODO
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
    droppedItem: () => {
        // TODO
        return new Entity()
    },
    barrier: ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
        return new Entity([new BoxCollider(pt(x, y), pt(width, height))])
    },
}

export type FeatureType = keyof typeof Features
export type FeatureData<F extends FeatureType> = Parameters<typeof Features[F]>[0]

export type Feature<F extends FeatureType> = {
    type: F
    data: FeatureData<F>
}

export const instantiateFeature = <F extends FeatureType>(
    type: F,
    data: FeatureData<F>
): Entity => {
    // @ts-ignore
    return Features[type](data)
}
