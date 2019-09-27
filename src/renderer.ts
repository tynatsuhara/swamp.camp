import { Entity } from "./entity"
import { Point } from "./util";

const CANVAS = <HTMLCanvasElement>document.getElementById('canvas')
const CANVAS_CONTEXT = CANVAS.getContext('2d')
const TILE_SET = <HTMLImageElement>document.getElementById("tileset")
const TILE_SET_SIZE = 32
export const TILE_SIZE = 16

export class Renderer {
    cameraOffsetX: number = 0
    cameraOffsetY: number = 0
    zoom: number = 2.5

    render(worldEntities: Entity[], uiEntities) {
        CANVAS.width = CANVAS.clientWidth
        CANVAS.height = CANVAS.clientHeight
        CANVAS_CONTEXT.imageSmoothingEnabled = false
        CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
        worldEntities.forEach(e => this.renderEntity(e, this.cameraOffsetX, this.cameraOffsetY))
        uiEntities.forEach(e => this.renderEntity(e, 0, 0))
    }

    getDimensions(): Point {
        return new Point(CANVAS.width/TILE_SIZE/this.zoom, CANVAS.height/TILE_SIZE/this.zoom)
    }

    renderEntity(entity: Entity, cameraOffsetX: number, cameraOffsetY: number) {
        CANVAS_CONTEXT.drawImage(
            TILE_SET, 
            entity.tileSetIndex.x * (TILE_SIZE + 1), 
            entity.tileSetIndex.y * (TILE_SIZE + 1), 
            TILE_SIZE, 
            TILE_SIZE, 
            this.pixelNum(entity.position.x * this.zoom + cameraOffsetX), 
            this.pixelNum(entity.position.y * this.zoom + cameraOffsetY), 
            TILE_SIZE * this.zoom, 
            TILE_SIZE * this.zoom
        )
    }

    private pixelNum(val: number): number {
        return val - val % this.zoom
    }
}