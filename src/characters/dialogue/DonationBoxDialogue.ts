import { ItemStack } from "../../items/Inventory"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { player } from "../player/index"
import {
    dialogue,
    DialogueOption,
    DialogueSet,
    DialogueSource,
    dialogueWithOptions,
    NextDialogue,
} from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const DONATION_DIALOGUE = "donate"
const DONATION_COMPLETED = "donate-completed"

type DonationOptions = {
    onDonationComplete: () => void
    itemsRequired: ItemStack[]
}

let currentOptions: DonationOptions

export const startDonating = (options: DonationOptions, source: DialogueSource) => {
    currentOptions = options
    DialogueDisplay.instance.startDialogue(source)
}

export const DONATION_DIALOGUES: DialogueSet = {
    [DONATION_DIALOGUE]: () => {
        const { onDonationComplete, itemsRequired } = currentOptions

        const hasRequiredMaterials = itemsRequired.every(
            (i) => player().inventory.getItemCount(i.item) >= i.count
        )
        const optionsStr = "\n" + itemsRequired.map((i) => i.stackString()).join("\n")
        const str = hasRequiredMaterials
            ? `You have all the supplies needed to begin construction:${optionsStr}`
            : `Return with these supplies to begin construction:${optionsStr}`

        const options = [
            new DialogueOption(DialogueConstants.CANCEL_TEXT, () => {
                return new NextDialogue(DONATION_DIALOGUE, false)
            }),
        ]

        if (hasRequiredMaterials) {
            options.unshift(
                new DialogueOption("Deliver supplies", () => {
                    itemsRequired.forEach((i) => player().inventory.removeItem(i.item, i.count))
                    onDonationComplete()
                    return new NextDialogue(DONATION_COMPLETED, true)
                })
            )
        }

        return dialogueWithOptions([str], InteractIndicator.NONE, ...options)
    },

    [DONATION_COMPLETED]: () => {
        return dialogue([
            "Construction is ready to begin! Talk to your villagers to assign them to construction.",
        ])
    },
}
