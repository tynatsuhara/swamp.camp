export class TileSet {
    readonly image: HTMLImageElement
    readonly tileSize: number
    readonly padding: number

    constructor(
        image: HTMLImageElement, 
        tileSize: number,
        padding: number = 0
    ) {
        this.image = image
        this.tileSize = tileSize
        this.padding = padding
    }
}
