import { Point } from "../../engine/point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OutdoorTileset extends SingleFileTileLoader {

    constructor() {
        super("images/env_outdoor_recolor.png", new Map([
            ["tree1base", new Point(15, 11)],
            ["tree1top", new Point(15, 10)],
            ["tree2base", new Point(18, 11)],
            ["tree2top", new Point(18, 10)],
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
            ["rock1", new Point(54, 21)],
            ["rock2", new Point(55, 21)],
            ["rock3", new Point(56, 21)],
            ["rock1mossy", new Point(54, 22)],
            ["rock2mossy", new Point(55, 22)],
            ["rock3mossy", new Point(56, 22)],
            ["rockItem", new Point(33, 9)],
            ["woodItem", new Point(34, 9)],
        ]))
    }
}