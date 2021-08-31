import { Lists } from "brigsby/dist/util/Lists"
import { dialogue, DialogueInstance, NextDialogue } from "./Dialogue"

export enum GenericDialogue {
    HELLO = "hello",
}

export const GENERIC_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [GenericDialogue.HELLO]: () => dialogue(
        [Lists.oneOf(["Hello!", "Greetings."])],
        () => new NextDialogue(GenericDialogue.HELLO, false),
    ),
}