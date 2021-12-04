import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SalePackage, TradeMenu } from "../../ui/TradeMenu"
import { Dude } from "../Dude"
import {
    DialogueInstance,
    DialogueOption,
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
            item: Item.HEART_CONTAINER,
            count: 1,
            price: 1,
        },
    ]
}

export const DOCTOR_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [DOCTOR_DIALOGUE_ENTRYPOINT]: () => {
        const doctor: Dude = DialogueDisplay.instance.source as Dude

        return dialogueWithOptions(
            ["I offer goods and services to keep the town healthy."],
            DudeInteractIndicator.NONE,
            new DialogueOption("What's for sale?", () => {
                TradeMenu.instance.buy(getItemsToBuy()).from(doctor)
                return new NextDialogue(DOCTOR_DIALOGUE_ENTRYPOINT, false)
            }),
            option(getExitText(), DOCTOR_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
