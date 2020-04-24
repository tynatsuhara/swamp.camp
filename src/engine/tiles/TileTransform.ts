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

    rotateAround(pt: Point, angle: number) {
        const cx = pt.x
        const cy = pt.y
        const x = this.position.x + this.dimensions.x/2
        const y = this.position.y + this.dimensions.y/2
        const radians = (Math.PI / 180) * -angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
        this.position = new Point(nx - this.dimensions.x/2, ny - this.dimensions.y/2)
        this.rotation += angle
    }
}
