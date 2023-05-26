import { Entity } from "brigsby/dist"
import { Location } from "../locations/Location"
import { barrier } from "./barrier"
import { mineInteriorBackground } from "./mineInteriorBackground"
import { navMeshCollider } from "./navMeshCollider"
import { sprite } from "./sprite"
import { tentInteriorSprite } from "./tentInteriorSprite"

// Features are non-grid aligned aspects of a location.
// These functions should take a single serializable object argument.
const FEATURES = {
    sprite,
    barrier,
    navMeshCollider,
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
