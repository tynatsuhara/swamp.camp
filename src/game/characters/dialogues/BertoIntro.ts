import { DialogueInstance, Dialogue, dialogueWithOptions, option, dialogue, NextDialogue, saveAfterDialogueStage } from "../Dialogue"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Player } from "../Player"
import { Item } from "../../items/Items"
import { Controls } from "../../Controls"
import { LocationManager } from "../../world/LocationManager"
import { ElementType } from "../../world/elements/Elements"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { WorldTime } from "../../world/WorldTime"

export const BERTO_INTRO_DIALOGUE: { [key: number]: () => DialogueInstance } = {
    [Dialogue.BERT_0]: () => dialogue(
        ["Good morrow! I, Sir Berto of Dube, present myself to thee as an emissary of The Honourable King Winston XVIII."],
        () => new NextDialogue(Dialogue.BERT_0, false),
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
    ),
}