import { Tile } from "./tile"

const CANVAS = <HTMLCanvasElement>document.getElementById('canvas')
const CANVAS_CONTEXT = CANVAS.getContext('2d')
const TILE_SET = <HTMLImageElement>document.getElementById("tileset")
const TILE_SET_SIZE = 32
const TILE_SIZE = 16

CANVAS_CONTEXT.imageSmoothingEnabled = false

export class Renderer {
    cameraOffsetX: number = 0
    cameraOffsetY: number = 0
    zoom: number = 1

    render(tiles: Tile[]) {
        CANVAS.width = CANVAS.clientWidth
        CANVAS.height = CANVAS.clientHeight
        CANVAS_CONTEXT.fillStyle = "#472d3c"
        CANVAS_CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height)
        CANVAS_CONTEXT.fill()
        // CANVAS_CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
        tiles.forEach(t => this.renderTile(t))
    }

    renderTile(tile: Tile) {
        CANVAS_CONTEXT.drawImage(
            TILE_SET, 
            tile.tileSetIndex.x * TILE_SIZE, 
            tile.tileSetIndex.y * TILE_SIZE, 
            TILE_SIZE, 
            TILE_SIZE, 
            tile.position.x * TILE_SIZE * this.zoom + this.cameraOffsetX, 
            tile.position.y * TILE_SIZE * this.zoom + this.cameraOffsetY, 
            TILE_SIZE * this.zoom, 
            TILE_SIZE * this.zoom
        )
    }
}