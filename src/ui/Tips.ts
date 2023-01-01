import { Lists } from "brigsby/dist/util/Lists"
import { controls } from "../Controls"

// TODO figure out where to display these
const getTip = () => {
    const tips = [`Sheath your weapon with ${controls.getSheathKeyString()} to move faster.`]

    return Lists.oneOf(tips)
}
