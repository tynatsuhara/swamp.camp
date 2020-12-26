import { Point } from "../../engine/point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OGTileset extends SingleFileTileLoader {

    constructor() {
        super("images/tilemap.png", new Map([
            ["wallLeft", new Point(7, 5)],
            ["wallCenter", new Point(8, 5)],
            ["wallRight", new Point(9, 5)],
        ]))
    }
}