import { Sounds } from "../audio/Sounds"
import { Dude } from "../characters/Dude"
import { player } from "../characters/player/index"
import { session } from "../online/session"
import { ItemSpec } from "./Items"

const consumable = (
    verb: string,
    sound: [string, number],
    hostFn: (consumer: Dude) => void
): ItemSpec["consumable"] => {
    return {
        verb,
        fn: (consumer: Dude) => {
            if (consumer === player()) {
                Sounds.play(...sound)
            }
            if (session.isHost()) {
                hostFn(consumer)
            }
        },
    }
}

export const ItemUtils = {
    consumable,
}
