import { Lists } from "brigsby/lib/util"
import { dialogue, DialogueSet, NextDialogue } from "./Dialogue"

export enum GenericDialogue {
    HELLO = "hello",
}

export const GENERIC_DIALOGUE: DialogueSet = {
    [GenericDialogue.HELLO]: () =>
        dialogue(
            [Lists.oneOf(["Hello!", "Greetings."])],
            () => new NextDialogue(GenericDialogue.HELLO, false)
        ),
}
