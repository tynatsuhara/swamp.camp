import { Point } from "../point"

export class TileTransform {
    position: Point
    rotation: number
    scale: number
    mirrorX: boolean
    mirrorY: boolean

    constructor(    
        position: Point = new Point(0, 0),
        rotation: number = 0,
        scale: number = 1,
        mirrorX: boolean = false,
        mirrorY: boolean = false
    ) {
        this.position = position
        this.rotation = rotation
        this.scale = scale
        this.mirrorX = mirrorX
        this.mirrorY = mirrorY
    }
}
