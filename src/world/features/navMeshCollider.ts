import { Entity, pt } from "brigsby/dist"
import { NavMeshCollider } from "../elements/NavMeshCollider"
import { Location } from "../locations/Location"

export const navMeshCollider = (
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
}
