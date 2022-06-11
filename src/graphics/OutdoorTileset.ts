import { Point } from "brigsby/dist/Point"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

export class OutdoorTileset extends SingleFileTileLoader {
    constructor() {
        super(
            "images/env_outdoor_recolor.png",
            new Map([
                ["bed", new Point(15, 3)],
                ["mushroomPlaced", new Point(29, 9)],
                ["meat1", new Point(55, 18)],
                ["berries", new Point(19, 11)],
                ["mushroom", new Point(30, 9)],
                ["treeRoundSapling", new Point(27, 8)],
                ["treeRoundSmall0", new Point(13, 9)],
                ["treeRoundSmall1", new Point(14, 9)],
                ["treeRoundSmall2", new Point(15, 9)],
                ["treeRoundBase0", new Point(13, 11)],
                ["treeRoundBase1", new Point(14, 11)],
                ["treeRoundBase2", new Point(15, 11)],
                ["treeRoundTop0", new Point(13, 10)],
                ["treeRoundTop1", new Point(14, 10)],
                ["treeRoundTop2", new Point(15, 10)],
                ["treePointySapling", new Point(27, 7)],
                ["treePointySmall0", new Point(16, 9)],
                ["treePointySmall1", new Point(17, 9)],
                ["treePointySmall2", new Point(18, 9)],
                ["treePointyBase0", new Point(16, 11)],
                ["treePointyBase1", new Point(17, 11)],
                ["treePointyBase2", new Point(18, 11)],
                ["treePointyTop0", new Point(16, 10)],
                ["treePointyTop1", new Point(17, 10)],
                ["treePointyTop2", new Point(18, 10)],
                ["redtentNW", new Point(46, 10)],
                ["redtentNE", new Point(47, 10)],
                ["redtentSW", new Point(46, 11)],
                ["redtentSE", new Point(47, 11)],
                ["bluetentNW", new Point(48, 10)],
                ["bluetentNE", new Point(49, 10)],
                ["bluetentSW", new Point(48, 11)],
                ["bluetentSE", new Point(49, 11)],
                ["redtentInterior", new Point(3, 25)],
                ["redtentCenter", new Point(4, 26)],
                ["redtentl", new Point(0, 26)],
                ["redtenttip", new Point(1, 26)],
                ["redtentr", new Point(2, 26)],
                ["bluetentInterior", new Point(6, 25)],
                ["bluetentCenter", new Point(7, 26)],
                ["bluetentl", new Point(0, 27)],
                ["bluetenttip", new Point(1, 27)],
                ["bluetentr", new Point(2, 27)],
                ["campfireLogs", new Point(13, 8)],
                ["campfireLogsSmall", new Point(15, 8)],
                ["campfireRing", new Point(14, 8)],
                ["grass1", new Point(22, 10)],
                ["grass2", new Point(22, 11)],
                ["rock1", new Point(54, 21)],
                ["rock2", new Point(55, 21)],
                ["rock3", new Point(56, 21)],
                ["rock1mossy", new Point(54, 22)],
                ["rock2mossy", new Point(55, 22)],
                ["rock3mossy", new Point(56, 22)],
                ["rockItem", new Point(33, 9)],
                ["woodItem", new Point(34, 9)],
                ["ironItem", new Point(35, 9)],
                ["dialogueBG", new Point(6, 28)],
                ["invBoxFrame", new Point(9, 25)],
                ["placingElementFrame_good", new Point(3, 28)],
                ["placingElementFrame_bad", new Point(0, 28)],
                ["placingElementFrame_small_good", new Point(0, 25)],
                ["placingElementFrame_small_bad", new Point(1, 25)],
                ["placingElementFrame_1x2_good_top", new Point(0, 23)],
                ["placingElementFrame_1x2_good_bottom", new Point(0, 24)],
                ["placingElementFrame_1x2_bad_top", new Point(1, 23)],
                ["placingElementFrame_1x2_bad_bottom", new Point(1, 24)],
                ["hardwood1", new Point(8, 2)],
                ["hardwood2", new Point(9, 2)],
                ["hardwood3", new Point(8, 3)],
                ["hardwood4", new Point(9, 3)],
                ["bench", new Point(18, 5)],
                ["podium", new Point(23, 3)],
            ])
        )
    }
}
