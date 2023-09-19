import { pt } from "brigsby/dist"
import { SingleFileTileLoader } from "./SingleFileTileLoader"

const KEYS = {
    // controls
    ["joystick-up"]: pt(28, 24),
    ["gamepad-triangle"]: pt(28, 25),
    ["gamepad-circle"]: pt(29, 25),
    ["gamepad-x"]: pt(30, 25),
    ["gamepad-square"]: pt(31, 25),
    ["gamepad-up"]: pt(28, 23),
    ["gamepad-right"]: pt(29, 23),
    ["gamepad-down"]: pt(30, 23),
    ["gamepad-left"]: pt(31, 23),
    ["keycap"]: pt(25, 15),
    ["pause"]: pt(28, 32),
    ["leftClick"]: pt(29, 32),
    ["rightClick"]: pt(30, 32),

    ["face-happy1"]: pt(19, 26),
    ["face-happy2"]: pt(21, 26),
    ["face-neutral"]: pt(19, 32),
    ["face-sad1"]: pt(22, 26),
    ["face-sad2"]: pt(20, 26),

    ["direction-sign"]: pt(0, 7),
    ["shovel"]: pt(10, 27),
    ["heart"]: pt(26, 22),
    ["potion1"]: pt(16, 25),
    ["potion2"]: pt(17, 25),
    ["potion3"]: pt(18, 25),
    ["bread"]: pt(15, 28),
    ["meat1"]: pt(16, 28),
    ["meat1raw"]: pt(16, 32),
    ["meat2"]: pt(17, 28),
    ["cheese"]: pt(18, 28),
    ["apple"]: pt(15, 29),
    ["pear"]: pt(16, 29),
    ["fish"]: pt(17, 29),
    ["egg"]: pt(18, 29),
    ["lighter-fluid"]: pt(15, 32),
    ["workbench"]: pt(15, 9),
    ["berries"]: pt(18, 32),
    ["bed"]: pt(5, 8),
    ["aoe_target"]: pt(22, 14),
    ["treePointy"]: pt(0, 1),
    ["treeRound"]: pt(4, 1),
    ["spike_club"]: pt(1, 24),
    ["axe"]: pt(7, 29),
    ["pickaxe"]: pt(11, 27),
    ["sword"]: pt(2, 28),
    ["spear"]: pt(8, 27),
    ["lantern"]: pt(12, 23),
    ["shield0"]: pt(5, 24),
    ["tent"]: pt(6, 20),
    ["coin"]: pt(22, 4),
    ["wood"]: pt(18, 6),
    ["rock"]: pt(5, 2),
    ["iron"]: pt(31, 0),
    ["mushroom"]: pt(31, 1),
    ["house"]: pt(8, 19),
    ["town-hall"]: pt(4, 20),
    ["church"]: pt(0, 19),
    ["cabin"]: pt(1, 19),
    ["chest"]: pt(8, 6),
    ["invBoxNW"]: pt(16, 19),
    ["textBoxNW"]: pt(16, 16),
    ["tooltipLeft"]: pt(16, 16),
    ["tooltipCenter"]: pt(17, 16),
    ["tooltipRight"]: pt(18, 16),
    ["btnLeft_white"]: pt(16, 17),
    ["btnCenter_white"]: pt(17, 17),
    ["btnRight_white"]: pt(18, 17),
    ["btnLeft_red"]: pt(16, 18),
    ["btnCenter_red"]: pt(17, 18),
    ["btnRight_red"]: pt(18, 18),
    ["arrow_up_1"]: pt(28, 20),
    ["arrow_right_1"]: pt(29, 20),
    ["arrow_down_1"]: pt(30, 20),
    ["arrow_left_1"]: pt(31, 20),
    ["arrow_up_2"]: pt(28, 21),
    ["arrow_right_2"]: pt(29, 21),
    ["arrow_down_2"]: pt(30, 21),
    ["arrow_left_2"]: pt(31, 21),
    ["floppy_drive"]: pt(26, 28),
    ["personsingle"]: pt(27, 28),
    ["personmultiple"]: pt(28, 28),
    ["small_arrow_up"]: pt(23, 20),
    ["small_arrow_right"]: pt(24, 20),
    ["small_arrow_down"]: pt(25, 20),
    ["small_arrow_left"]: pt(26, 20),
    ["slash"]: pt(25, 11),
    ["boatright"]: pt(11, 19),
    ["ship"]: pt(11, 20),
    ["crown1"]: pt(11, 24),
    ["crown2"]: pt(12, 24),
    [" "]: pt(0, 0),
    ["0"]: pt(19, 29),
    ["1"]: pt(20, 29),
    ["2"]: pt(21, 29),
    ["3"]: pt(22, 29),
    ["4"]: pt(23, 29),
    ["5"]: pt(24, 29),
    ["6"]: pt(25, 29),
    ["7"]: pt(26, 29),
    ["8"]: pt(27, 29),
    ["9"]: pt(28, 29),
    [":"]: pt(29, 29),
    ["."]: pt(30, 29),
    ["%"]: pt(31, 29),
    ["!"]: pt(19, 25),
    ["?"]: pt(21, 25),
    ["$"]: pt(19, 28),
    ["a"]: pt(19, 30),
    ["b"]: pt(20, 30),
    ["c"]: pt(21, 30),
    ["d"]: pt(22, 30),
    ["e"]: pt(23, 30),
    ["f"]: pt(24, 30),
    ["g"]: pt(25, 30),
    ["h"]: pt(26, 30),
    ["i"]: pt(27, 30),
    ["j"]: pt(28, 30),
    ["k"]: pt(29, 30),
    ["l"]: pt(30, 30),
    ["m"]: pt(31, 30),
    ["n"]: pt(19, 31),
    ["o"]: pt(20, 31),
    ["p"]: pt(21, 31),
    ["q"]: pt(22, 31),
    ["r"]: pt(23, 31),
    ["s"]: pt(24, 31),
    ["t"]: pt(25, 31),
    ["u"]: pt(26, 31),
    ["v"]: pt(27, 31),
    ["w"]: pt(28, 31),
    ["x"]: pt(29, 31),
    ["y"]: pt(30, 31),
    ["z"]: pt(31, 31),
    ["copy"]: pt(31, 32),
    ["campfire"]: pt(14, 10),
    ["fireball"]: pt(15, 10),
    ["tombstone1"]: pt(0, 14),
    ["tombstone2"]: pt(1, 14),
    ["skull-n-bones"]: pt(0, 15),
    ["skull1"]: pt(18, 24),
    ["skull2"]: pt(22, 23),
    ["miniMapPlayer"]: pt(11, 22),
    ["ladder"]: pt(0, 6),
    ["map"]: pt(16, 27),
    ["small-circle"]: pt(27, 20),
}

export type Icon = keyof typeof KEYS

export class OneBitTileset extends SingleFileTileLoader<Icon> {
    constructor() {
        super("images/monochrome_transparent_1_bit.png", KEYS)
    }
}
