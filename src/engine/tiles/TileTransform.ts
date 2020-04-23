import { Point } from "../point"

export class TileTransform {
    position: Point
    rotation: number
    scale: number
    mirrorX: boolean
    mirrorY: boolean
    depth: number

    constructor(    
        position: Point = new Point(0, 0),
        rotation: number = 0,
        scale: number = 1,
        mirrorX: boolean = false,
        mirrorY: boolean = false,
        depth: number = Number.MIN_SAFE_INTEGER
    ) {
        this.position = position
        this.rotation = rotation
        this.scale = scale
        this.mirrorX = mirrorX
        this.mirrorY = mirrorY
        this.depth = depth
    }
}
