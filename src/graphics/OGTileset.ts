import { Point } from "brigsby/dist"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

const KEYS = {
    wallLeft: new Point(7, 5),
    wallCenter: new Point(8, 5),
    wallRight: new Point(9, 5),
}

export class OGTileset extends SingleFileTileLoader<keyof typeof KEYS> {
    constructor() {
        super("images/tilemap.png", KEYS)
    }
}
