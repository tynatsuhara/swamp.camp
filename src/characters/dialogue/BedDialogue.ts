import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Bed } from "../../world/elements/Bed"
import { here } from "../../world/locations/LocationManager"
import { player } from "../player/index"
import {
    dialogue,
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    NextDialogue,
} from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const BED_DIALOGUE = "bed"

export const BED_DIALOGUES: DialogueSet = {
    [BED_DIALOGUE]: () => {
        const bed: Bed = DialogueDisplay.instance.source as Bed
        const completeDialogue = new NextDialogue(BED_DIALOGUE, false)

        const bedType = bed.isBedroll ? "bedroll" : "bed"

        // Proxy for determining that this bed belongs to the player
        if (!here().allowPlacing) {
            return dialogue(
                [`This ${bedType} doesn't belong to you.`],
                () => completeDialogue,
                DudeInteractIndicator.NONE
            )
        }

        let text: string
        let options = [
            new DialogueOption("Sleep (8 hours)", () => {
                bed.rest(8)
                player().heal(player().maxHealth)
                return completeDialogue
            }),
            new DialogueOption("Nap (1 hour)", () => {
                bed.rest(1)
                player().heal(player().maxHealth / 2)
                return completeDialogue
            }),
            new DialogueOption(DialogueConstants.CANCEL_TEXT, () => completeDialogue),
        ]

        if (bed.canRestFor(8)) {
            text = `The comfy ${bedType} beckons to you. Do you give in?`
        } else if (bed.canRestFor(1)) {
            text =
                "Your campfire will not burn long enough for a full rest, but you have time for a nap."
            options.splice(0, 1)
        } else {
            return dialogue(
                ["You cannot sleep if your campfire is out."],
                () => completeDialogue,
                DudeInteractIndicator.NONE
            )
        }

        return dialogueWithOptions([text], DudeInteractIndicator.NONE, ...options)
    },
}
