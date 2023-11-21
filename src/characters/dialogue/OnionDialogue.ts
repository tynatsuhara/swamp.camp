import { Lists } from "brigsby/dist/util"
import { CommonWorldSounds } from "../../audio/CommonWorldSounds"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { Dude } from "../Dude"
import {
    DialogueOption,
    DialogueSet,
    NextDialogue,
    dialogueWithOptions,
    getExitText,
    option,
} from "./Dialogue"

export const ONION_DIALOGUE_ENTRYPOINT = "onion-start"

const ONION_LAST_GOODBYES = ["Forgive me.", "Goodbye.", "Your time has come.", "I'm sorry."]

export const ONION_DIALOGUE: DialogueSet = {
    [ONION_DIALOGUE_ENTRYPOINT]: (onion: Dude) => {
        return dialogueWithOptions(
            ["*The strange sentient onion looks up at you inquisitively.*"],
            InteractIndicator.NONE,
            new DialogueOption(`${Lists.oneOf(ONION_LAST_GOODBYES)} [Eat onion]`, () => {
                CommonWorldSounds.playEatSound()
                return new NextDialogue(ONION_DIALOGUE_ENTRYPOINT, false)
            }),
            option(getExitText(), ONION_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
