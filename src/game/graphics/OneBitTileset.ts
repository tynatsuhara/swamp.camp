import { Point } from "../../engine/point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OneBitTileset extends SingleFileTileLoader {

    constructor() {
        super("images/monochrome_transparent_1_bit.png", new Map([
            ["coin", new Point(22, 4)],
            ["wood", new Point(18, 6)],
            ["rock", new Point(5, 2)],
            ["slash", new Point(25, 11)],
            [" ", new Point(0, 0)],
            ["0", new Point(19, 29)],
            ["1", new Point(20, 29)],
            ["2", new Point(21, 29)],
            ["3", new Point(22, 29)],
            ["4", new Point(23, 29)],
            ["5", new Point(24, 29)],
            ["6", new Point(25, 29)],
            ["7", new Point(26, 29)],
            ["8", new Point(27, 29)],
            ["9", new Point(28, 29)],
            [":", new Point(29, 29)],
            [".", new Point(30, 29)],
            ["%", new Point(31, 29)],
            ["!", new Point(19, 25)],
            ["?", new Point(21, 25)],
            ["$", new Point(19, 28)],
            ["a", new Point(19, 30)],
            ["b", new Point(20, 30)],
            ["c", new Point(21, 30)],
            ["d", new Point(22, 30)],
            ["e", new Point(23, 30)],
            ["f", new Point(24, 30)],
            ["g", new Point(25, 30)],
            ["h", new Point(26, 30)],
            ["i", new Point(27, 30)],
            ["j", new Point(28, 30)],
            ["k", new Point(29, 30)],
            ["l", new Point(30, 30)],
            ["m", new Point(31, 30)],
            ["n", new Point(19, 31)],
            ["o", new Point(20, 31)],
            ["p", new Point(21, 31)],
            ["q", new Point(22, 31)],
            ["r", new Point(23, 31)],
            ["s", new Point(24, 31)],
            ["t", new Point(25, 31)],
            ["u", new Point(26, 31)],
            ["v", new Point(27, 31)],
            ["w", new Point(28, 31)],
            ["x", new Point(29, 31)],
            ["y", new Point(30, 31)],
            ["z", new Point(31, 31)]
        ]))
    }
}