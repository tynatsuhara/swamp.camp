import { Lists } from "brigsby/dist/util"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"

/**
 * All supported glyphs:
 * ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽabcčćdđefghijklmnopqrsštuvwxyzžАБВГД
 * ЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгдђеёєжзѕиіїйјклљмнњопрст
 * ћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω1234
 * 567890‘?’“!”(%)[#]{@}/&\<-+÷×=>®©$€£¥¢:;,.*
 */

const LANGUAGE_CHARACTERS = Array.from(
    "ČĆĐŠŽčćđšžБГДЂЁЄЖЗЅИЇЙЛЉЊПЋЎФЦЧЏШЩЪЫЬЭЮЯбвгдђёєжзѕиїйклљмнњптћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω"
)

const getSentence = (punctuation: string[]) => {
    const word = () => {
        const wordLen = Math.ceil(Math.random() * 10)
        return Lists.range(0, wordLen)
            .map(() => Lists.oneOf(LANGUAGE_CHARACTERS))
            .join("")
    }
    let result = word()
    const wordCount = 2 + Math.floor(Math.random() * 8)
    Lists.range(0, wordCount).forEach(() => {
        result += ` ${word()}`
    })
    result += Lists.oneOf(punctuation)
    return result
}

export const SPOOKY_VISITOR_STARTING_DIALOGUE = "spooky-0"

export const SPOOKY_VISITOR_DIALOGUE: DialogueSet = {
    [SPOOKY_VISITOR_STARTING_DIALOGUE]: () => {
        return dialogueWithOptions(
            () => [
                getSentence([".", "!"]),
                "*The mysterious visitor opens their cloak, revealing an array of trinkets.*",
                getSentence(["?"]),
            ],
            InteractIndicator.NONE,
            new DialogueOption("Take a look", () => {
                console.log("TODO: open trade window")
                return new NextDialogue(SPOOKY_VISITOR_STARTING_DIALOGUE, false)
            }),
            new DialogueOption(
                "Back away",
                () => new NextDialogue(SPOOKY_VISITOR_STARTING_DIALOGUE, false)
            )
        )
    },
}
