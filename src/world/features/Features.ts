import { Entity, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"
import { BasicRenderComponent } from "brigsby/dist/renderer"
import { SpriteTransform } from "brigsby/dist/sprites"
import { Tilesets } from "../../graphics/Tilesets"
import { mineInteriorBackground } from "../buildings/MineEntrance"
import { tentInteriorSprite } from "../buildings/Tent"
import { NavMeshCollider } from "../elements/NavMeshCollider"
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
    tentInteriorSprite,
    mineInteriorBackground,
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
