import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import {
    DialogueInstance,
    DialogueOption,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
} from "./Dialogue"

export const VILLAGER_DIALOGUE_ENTRYPOINT = "villager-start"

export const VILLAGER_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [VILLAGER_DIALOGUE_ENTRYPOINT]: () => {
        // TODO add a different initial dialogue with a "!"

        return dialogueWithOptions(
            ["What should I do?"], // TODO flesh out the text
            DudeInteractIndicator.NONE,
            new DialogueOption("Head down to the mines.", () => {
                return new NextDialogue(VILLAGER_DIALOGUE_ENTRYPOINT, false)
            }),
            option(getExitText(), VILLAGER_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
