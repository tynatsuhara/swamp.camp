import { DialogueInstance, Dialogue, dialogue, NextDialogue } from "../Dialogue"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"

export const BERTO_INTRO_DIALOGUE: { [key: number]: () => DialogueInstance } = {
    [Dialogue.BERT_0]: () => dialogue(
        ["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Winston XVIII."],
        () => new NextDialogue(Dialogue.BERT_0, false),
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
    ),
}