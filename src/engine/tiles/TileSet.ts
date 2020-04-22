import { tileEditor } from "./TileEditor"

export class TileSet {
    readonly image: HTMLImageElement

    constructor(id: string) {
        this.image = <HTMLImageElement>document.getElementById(id)
        tileEditor.register(id, this)
    }
}
