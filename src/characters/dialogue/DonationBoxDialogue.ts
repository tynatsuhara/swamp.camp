import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import {
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
} from "./Dialogue"

export const DONATION_DIALOGUE = "donate"

let onCloseFn: () => void

export const startDonating = (onClose: () => void) => {
    onCloseFn = onClose
    DialogueDisplay.instance.startDialogue({ dialogue: DONATION_DIALOGUE })
}

export const DONATION_DIALOGUES: DialogueSet = {
    [DONATION_DIALOGUE]: () => {
        return dialogueWithOptions(
            ["todo"],
            DudeInteractIndicator.NONE,
            new DialogueOption(getExitText(), () => {
                onCloseFn()
                return new NextDialogue(DONATION_DIALOGUE, false)
            })
        )
    },
}
