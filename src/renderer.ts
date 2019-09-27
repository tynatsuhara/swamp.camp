import { Entity } from "./entity"

const CANVAS = <HTMLCanvasElement>document.getElementById('canvas')
const CANVAS_CONTEXT = CANVAS.getContext('2d')
const TILE_SET = <HTMLImageElement>document.getElementById("tileset")
const TILE_SET_SIZE = 32
const TILE_SIZE = 16

export class Renderer {
    cameraOffsetX: number = 0
    cameraOffsetY: number = 0
    zoom: number = 2.5

    render(entities: Entity[]) {
        CANVAS.width = CANVAS.clientWidth
        CANVAS.height = CANVAS.clientHeight
        CANVAS_CONTEXT.imageSmoothingEnabled = false
        CANVAS_CONTEXT.fillStyle = "#472d3c"
        CANVAS_CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height)
        CANVAS_CONTEXT.fill()
        // CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
        entities.forEach(e => this.renderEntity(e))
    }

    renderEntity(entity: Entity) {
        CANVAS_CONTEXT.drawImage(
            TILE_SET, 
            entity.tileSetIndex.x * TILE_SIZE, 
            entity.tileSetIndex.y * TILE_SIZE, 
            TILE_SIZE, 
            TILE_SIZE, 
            entity.position.x * TILE_SIZE * this.zoom + this.cameraOffsetX, 
            entity.position.y * TILE_SIZE * this.zoom + this.cameraOffsetY, 
            TILE_SIZE * this.zoom, 
            TILE_SIZE * this.zoom
        )
    }
}