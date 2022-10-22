// WIP

import { Entity, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"

// function args must be serializable
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
        rotation: number
        depth: number
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
    droppedItem: () => {
        return new Entity()
    },
    barrier: ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => {
        return new Entity([new BoxCollider(pt(x, y), pt(width, height))])
    },
}

export type FeatureType = keyof typeof Features
export type FeatureData<F extends FeatureType> = Parameters<typeof Features[F]>

export type Feature<F extends FeatureType> = {
    type: F
    data: FeatureData<F>
}

export const instantiateFeature = <F extends FeatureType>(
    type: F,
    data: Parameters<typeof Features[F]>[0]
): Entity => {
    // @ts-ignore
    return Features[type](data)
}

export type InstantiateFeatureArgs = Parameters<typeof instantiateFeature>
