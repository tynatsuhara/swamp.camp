import { Item } from "../../items/Items"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { SalePackage, TradeMenu } from "../../ui/TradeMenu"
import { Dude } from "../Dude"
import {
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
} from "./Dialogue"

export const DOCTOR_DIALOGUE_ENTRYPOINT = "doc-start"

const getItemsToBuy = (): SalePackage[] => {
    return [
        {
            item: Item.WEAK_MEDICINE,
            count: 1,
            price: 10,
        },
        {
            item: Item.POISON_ANTIDOTE,
            count: 1,
            price: 5,
        },
        {
            item: Item.HEART_CONTAINER,
            count: 1,
            price: 20,
        },
    ]
}

export const DOCTOR_DIALOGUE: DialogueSet = {
    [DOCTOR_DIALOGUE_ENTRYPOINT]: (doctor: Dude) => {
        return dialogueWithOptions(
            ["I offer goods and services to keep the town healthy."],
            InteractIndicator.NONE,
            new DialogueOption("What's for sale?", () => {
                TradeMenu.instance.buy(getItemsToBuy()).from(doctor)
                return new NextDialogue(DOCTOR_DIALOGUE_ENTRYPOINT, false)
            }),
            option(getExitText(), DOCTOR_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
