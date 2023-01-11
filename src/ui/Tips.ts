import { Component } from "brigsby/dist/Component"
import { UpdateData } from "brigsby/dist/Engine"
import { Point, pt } from "brigsby/dist/Point"
import { controls } from "../Controls"
import { Color } from "./Color"
import { formatText, TextAlign } from "./Text"
import { UIStateManager } from "./UIStateManager"

const getTips = () => [
    `Sheath your weapon with ${controls.getSheathKeyString()} to move faster.`,
    `Blackberries are a good source of food — just try not to walk through them.`,
    `Mushrooms provide more food as they get larger — but they also become more aggressive.`,
    `Some raw food can make you sick. You can cook food at campfires.`,
    `If you're on fire, rolling with ${controls.getRollString()} will extinguish it faster.`,
    `Use tools to collect resources more efficiently.`,
    `When holding a torch, hold ${controls.getBlockString()} to light shit on fire. Be careful!`,
    `Melee attacks can be dodged by rolling with ${controls.getRollString()}.`,
    `Jump over fires and blackberries to avoid taking damage.`,
    // `A well-timed blocked will stun most melee attackers.`, // TODO implement this
]

const TIP_KEY = "tip"

const getTipIndex = () => {
    return Number(localStorage.getItem(TIP_KEY))
}

export const cycleTipIndex = (direction: 1 | -1) => {
    let newIndex = getTipIndex() + direction
    if (newIndex === -1) {
        newIndex = getTips().length - 1
    } else if (newIndex === getTips().length) {
        newIndex = 0
    }
    localStorage.setItem(TIP_KEY, `${newIndex}`)
}

const WIDTH = 250

export class TipDisplay extends Component {
    private position: Point

    update({ dimensions }: UpdateData) {
        this.position = pt((dimensions.x - WIDTH) / 2, 40)

        if (controls.isNextTipButtonwDown()) {
            cycleTipIndex(1)
        } else if (controls.isPrevTipButtonwDown()) {
            cycleTipIndex(-1)
        }
    }

    getRenderMethods() {
        const depth = UIStateManager.UI_SPRITE_DEPTH + 5
        const formatTextArgs = {
            text: `TIP: ${getTips()[getTipIndex()]}`,
            position: this.position,
            color: Color.WHITE,
            width: WIDTH,
            alignment: TextAlign.CENTER,
            depth,
        }
        return [
            ...formatText(formatTextArgs),
            ...formatText({
                ...formatTextArgs,
                position: formatTextArgs.position.plusX(-1).plusY(1),
                color: Color.RED_1,
                depth: formatTextArgs.depth - 1,
            }),
        ]
    }
}
