import { DialogueInstance, Dialogue, dialogue, NextDialogue, dialogueWithOptions, DialogueOption, option } from "../Dialogue"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SellMenu, SalePackage } from "../../ui/SellMenu"
import { Item } from "../../items/Items"
import { WorldLocation } from "../../world/WorldLocation"
import { LocationManager } from "../../world/LocationManager"
import { DudeType } from "../DudeFactory"
import { NPC } from "../NPC"
import { NPCSchedules } from "../NPCSchedule"
import { MapGenerator } from "../../world/MapGenerator"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { WorldTime } from "../../world/WorldTime"

const getItemsToSell = (): SalePackage[] => {
    return [{
        item: Item.WOOD,
        count: 10,
        price: 5,
    },
    {
        item: Item.ROCK,
        count: 10,
        price: 5,
    },
    {
        item: Item.IRON,
        count: 10,
        price: 20,
    }]
}

const getGreeting = () => {
    return "Tally ho!"
}

export const BERTO_INTRO_DIALOGUE: { [key: number]: () => DialogueInstance } = {
    [Dialogue.BERT_0]: () => dialogueWithOptions(
        ["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII.",
        "Should thy choose to collect raw materials, I will purchase them on behalf of The Kingdom.",
        "Upon receipt of a fee and construction of an appropriate dwelling, I can also bring tax-paying subjects to populate thy settlement.",
        "Tradesmen! Knights! Worthless peons to scrub latrines and polish thy armor!",
        "Art thou interested in any of my services at the moment?"],
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
        option("Sure!", Dialogue.BERT_MENU, true),
        option("Maybe later.", Dialogue.BERT_MENU_INTRO, false),
    ),
    [Dialogue.BERT_MENU_INTRO]: () => dialogue(
        [getGreeting()],
        () => new NextDialogue(Dialogue.BERT_MENU, true)
    ),
    [Dialogue.BERT_MENU]: () => dialogueWithOptions(
        ["How shall I assist thee?"],
        DudeInteractIndicator.NONE,
        new DialogueOption("What are you buying?", () => {
            SellMenu.instance.show(getItemsToSell())
            return new NextDialogue(Dialogue.BERT_MENU_INTRO, false)
        }),
        new DialogueOption("We need a new settler.", () => {
            return new NextDialogue(Dialogue.BERT_VILLAGERS, true)
        }),
        option("Never mind.", Dialogue.BERT_MENU_INTRO, false)
    ),
    [Dialogue.BERT_VILLAGERS]: () => dialogueWithOptions(
        ["At present, only felonious peons can be spared by The King.",
        "Shall I return to The Kingdom, bringing word that thou art requesting a settler?"],
        DudeInteractIndicator.NONE,
        new DialogueOption("Bring me a criminal.", () => {
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_DEPARTURE,
                time: WorldTime.instance.time
            })
            return new NextDialogue(Dialogue.BERT_MENU_INTRO, false)
        }),
        option("Never mind.", Dialogue.BERT_MENU_INTRO, false)
    )
}