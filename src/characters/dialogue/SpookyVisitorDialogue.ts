import { Lists } from "brigsby/dist/util/Lists"
import { dialogue, DialogueInstance, NextDialogue } from "./Dialogue"

/**
 * All supported glyphs:
 * ABCČĆDĐEFGHIJKLMNOPQRSŠTUVWXYZŽabcčćdđefghijklmnopqrsštuvwxyzžАБВГҐД
 * ЂЕЁЄЖЗЅИІЇЙЈКЛЉМНЊОПРСТЋУЎФХЦЧЏШЩЪЫЬЭЮЯабвгґдђеёєжзѕиіїйјклљмнњопрст
 * ћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω1234
 * 567890‘?’“!”(%)[#]{@}/&\<-+÷×=>®©$€£¥¢:;,.*
 */

const LANGUAGE_CHARACTERS = Array.from(
    "ČĆĐŠŽčćđšžБГҐДЂЁЄЖЗЅИЇЙЛЉЊПЋЎФЦЧЏШЩЪЫЬЭЮЯбвгґдђёєжзѕиїйклљмнњптћуўфхцчџшщъыьэюяΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω"
)

const getSentence = () => {
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
    result += Lists.oneOf([".", "!", "?"])
    return result
}

export const SPOOKY_VISITOR_STARTING_DIALOGUE = "spooky-0"

export const SPOOKY_VISITOR_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [SPOOKY_VISITOR_STARTING_DIALOGUE]: () => {
        return dialogue(
            [getSentence()],
            () => new NextDialogue(SPOOKY_VISITOR_STARTING_DIALOGUE, false)
        )
    },
}
