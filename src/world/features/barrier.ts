import { Entity, pt } from "brigsby/dist"
import { BoxCollider } from "brigsby/dist/collision"

export const barrier = ({
    x,
    y,
    width,
    height,
}: {
    x: number
    y: number
    width: number
    height: number
}) => {
    return new Entity([new BoxCollider(pt(x, y), pt(width, height))])
}
