import { Point } from "../../engine/point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OutdoorTileset extends SingleFileTileLoader {

    constructor() {
        super("images/env_outdoor_recolor.png", new Map([
            ["tree1base", new Point(13, 11)],
            ["tree1top", new Point(13, 10)],
            ["redtentNW", new Point(46, 10)],
            ["redtentNE", new Point(47, 10)],
            ["redtentSW", new Point(46, 11)],
            ["redtentSE", new Point(47, 11)],
            ["bluetentNW", new Point(48, 10)],
            ["bluetentNE", new Point(49, 10)],
            ["bluetentSW", new Point(48, 11)],
            ["bluetentSE", new Point(49, 11)],
            ["campfireOff", new Point(13, 8)],
            ["campfireOn", new Point(14, 8)],
        ]))
    }
}