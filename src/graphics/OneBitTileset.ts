import { Point } from "brigsby/dist/Point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OneBitTileset extends SingleFileTileLoader {

    constructor() {
        super("images/monochrome_transparent_1_bit.png", new Map([
            ["bed", new Point(5, 8)],
            ["aoe_target", new Point(22, 14)],
            ["treePointy", new Point(0, 1)],
            ["treeRound", new Point(4, 1)],
            ["spike_club", new Point(1, 24)],
            ["axe", new Point(7, 29)],
            ["pickaxe", new Point(11, 27)],
            ["sword", new Point(2, 28)],
            ["spear", new Point(8, 27)],
            ["lantern", new Point(12, 23)],
            ["shield0", new Point(5, 24)],
            ["tent", new Point(6, 20)],
            ["coin", new Point(22, 4)],
            ["wood", new Point(18, 6)],
            ["rock", new Point(5, 2)],
            ["iron", new Point(31, 0)],
            ["mushroom", new Point(31, 1)],
            ["house", new Point(8, 19)],
            ["chest", new Point(8, 6)],
            ["invBoxNW", new Point(16, 19)],
            ["textBoxNW", new Point(16, 16)],
            ["tooltipLeft", new Point(16, 16)],
            ["tooltipCenter", new Point(17, 16)],
            ["tooltipRight", new Point(18, 16)],
            ["btnLeft_white", new Point(16, 17)],
            ["btnCenter_white", new Point(17, 17)],
            ["btnRight_white", new Point(18, 17)],
            ["btnLeft_red", new Point(16, 18)],
            ["btnCenter_red", new Point(17, 18)],
            ["btnRight_red", new Point(18, 18)],
            ["arrow_up_1", new Point(28, 20)],
            ["arrow_right_1", new Point(29, 20)],
            ["arrow_down_1", new Point(30, 20)],
            ["arrow_left_1", new Point(31, 20)],
            ["arrow_up_2", new Point(28, 21)],
            ["arrow_right_2", new Point(29, 21)],
            ["arrow_down_2", new Point(30, 21)],
            ["arrow_left_2", new Point(31, 21)],
            ["floppy_drive", new Point(26, 28)],
            ["small_arrow_up", new Point(23, 20)],
            ["small_arrow_right", new Point(24, 20)],
            ["small_arrow_down", new Point(25, 20)],
            ["small_arrow_left", new Point(26, 20)],
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
            ["z", new Point(31, 31)],
            ["autosave", new Point(18, 8)],
            ["campfire", new Point(14, 10)],
            ["keycap", new Point(25, 15)],
            ["leftClick", new Point(29, 15)],
            ["rightClick", new Point(30, 15)],
            ["tombstone1", new Point(0, 14)],
            ["tombstone2", new Point(1, 14)],
            ["skull-n-bones", new Point(0, 15)],
            ["skull1", new Point(18, 24)],
            ["skull2", new Point(22, 23)],
            ["miniMapPlayer", new Point(11, 22)],
            ["ladder", new Point(0, 6)],
        ]))
    }
}