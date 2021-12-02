import { Item } from "../../items/Items"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SalePackage, SellMenu } from "../../ui/SellMenu"
import {
    DialogueInstance,
    DialogueOption,
    dialogueWithOptions,
    NextDialogue,
    option,
} from "./Dialogue"

export const DOCTOR_DIALOGUE_ENTRYPOINT = "doc-start"

const getItemsToSell = (): SalePackage[] => {
    return [
        {
            item: Item.WOOD,
            count: 10,
            price: 5,
        },
        {
            item: Item.ROCK,
            count: 10,
            price: 5,
        },
        {
            item: Item.IRON,
            count: 10,
            price: 20,
        },
    ]
}

export const DOCTOR_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [DOCTOR_DIALOGUE_ENTRYPOINT]: () => {
        return dialogueWithOptions(
            [`It looks like you have enough rocks and wood. Should we put together a campfire?`],
            DudeInteractIndicator.NONE,
            new DialogueOption("Let's craft", () => {
                SellMenu.instance.show(getItemsToSell())
                return new NextDialogue(DOCTOR_DIALOGUE_ENTRYPOINT, false)
            }),
            option("Not yet.", DOCTOR_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
