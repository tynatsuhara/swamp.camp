import { Item } from "../../items/Items"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SalePackage, SellMenu } from "../../ui/SellMenu"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { LocationManager } from "../../world/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { WorldTime } from "../../world/WorldTime"
import { DudeType } from "../DudeFactory"
import { dialogue, DialogueInstance, DialogueOption, dialogueWithOptions, NextDialogue, option } from "./Dialogue"

export const BERTO_STARTING_DIALOGUE = "bert-start"
const BERT_MENU = "bert-menu", 
      BERT_MENU_INTRO = "bert-menu-intro", 
      BERT_VILLAGERS = "bert-villagers",
      BERT_LEAVING = "bert-leaving"

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

export const BERTO_INTRO_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [BERTO_STARTING_DIALOGUE]: () => dialogueWithOptions(
        ["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII.",
        "Should thy choose to collect raw materials, I will purchase them on behalf of The Kingdom.",
        "Upon receipt of a fee and construction of an appropriate dwelling, I can also bring tax-paying subjects to populate thy settlement.",
        "Tradesmen! Knights! Worthless peons to scrub latrines and polish thine armor!",
        "Art thou interested in any of my services at the moment?"],
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
        option("Sure!", BERT_MENU, true),
        option("Maybe later.", BERT_MENU_INTRO, false),
    ),
    [BERT_MENU_INTRO]: () => dialogue(
        [getGreeting()],
        () => new NextDialogue(BERT_MENU, true)
    ),
    [BERT_MENU]: () => dialogueWithOptions(
        ["How shall I assist thee?"],
        DudeInteractIndicator.NONE,
        new DialogueOption("What are you buying?", () => {
            SellMenu.instance.show(getItemsToSell())
            return new NextDialogue(BERT_MENU_INTRO, false)
        }),
        new DialogueOption("We need a new settler.", () => {
            return new NextDialogue(BERT_VILLAGERS, true)
        }),
        option("Never mind.", BERT_MENU_INTRO, false)
    ),
    [BERT_VILLAGERS]: () => fetchNpcDialogue(),
    [BERT_LEAVING]: () => dialogue(
        ["I shall return posthaste!"],
        () => new NextDialogue(BERT_MENU_INTRO, false)
    )
}

const fetchNpcDialogue = (): DialogueInstance => {
    const openHouses = LocationManager.instance.currentLocation.getElements()
            .map(e => e.entity.getComponent(Residence))
            .filter(residence => residence?.hasCapacity(DudeType.VILLAGER))

    if (openHouses.length === 0) {
        return dialogue(
            ["Alas, thy settlement does not have appropriate lodging for a new settler.",
            "Return to me once thou hast constructed a dwelling."],
            () => new NextDialogue(BERT_MENU_INTRO, false)
        )
    }

    const criminalOption = new DialogueOption("Bring me a criminal.", () => {
        openHouses[0].setResidentPending() 
        EventQueue.instance.addEvent({
            type: QueuedEventType.HERALD_DEPARTURE,
            time: WorldTime.instance.time
        })
        return new NextDialogue(BERT_LEAVING, true)
    })

    const options = [
        criminalOption,
        option("Never mind.", BERT_MENU_INTRO, false)
    ]

    return dialogueWithOptions(
        ["At present, only felonious peons can be spared by The King.",
        "Shall I return to The Kingdom, bringing word that thou art requesting a settler?"],
        DudeInteractIndicator.NONE,
        ...options
    )
}