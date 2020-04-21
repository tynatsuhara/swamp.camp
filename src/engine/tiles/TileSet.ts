import { tileEditor } from "./TileEditor"

export class TileSet {
    readonly image: HTMLImageElement
    readonly tileSize: number
    readonly padding: number

    constructor(
        id: string,
        tileSize: number,
        padding: number = 0
    ) {
        this.image = <HTMLImageElement>document.getElementById(id)
        this.tileSize = tileSize
        this.padding = padding

        tileEditor.register(id, this)
    }
}
