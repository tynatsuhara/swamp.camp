import { Lists } from "brigsby/dist/util/Lists"
import { controls } from "../Controls"

// TODO figure out where to display these
const getTip = () => {
    const tips = [
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

    return Lists.oneOf(tips)
}
