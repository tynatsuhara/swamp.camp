import { Point } from "../point"

export class TileTransform {
    position: Point
    dimensions: Point
    rotation: number
    mirrorX: boolean
    mirrorY: boolean
    depth: number

    constructor(    
        position: Point = new Point(0, 0),
        dimensions: Point = null,  // if null, match the dimensions of the source image
        rotation: number = 0,
        mirrorX: boolean = false,
        mirrorY: boolean = false,
        depth: number = Number.MIN_SAFE_INTEGER
    ) {
        this.position = position
        this.dimensions = dimensions
        this.rotation = rotation
        this.mirrorX = mirrorX
        this.mirrorY = mirrorY
        this.depth = depth
    }
}
