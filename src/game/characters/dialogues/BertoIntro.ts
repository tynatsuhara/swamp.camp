import { Item } from "../../items/Items"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SalePackage, SellMenu } from "../../ui/SellMenu"
import { ElementType } from "../../world/elements/Elements"
import { House } from "../../world/elements/House"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { LocationManager } from "../../world/LocationManager"
import { WorldTime } from "../../world/WorldTime"
import { dialogue, DialogueInstance, DialogueOption, dialogueWithOptions, NextDialogue, option } from "../Dialogue"

export const BERTO_STARTING_DIALOGUE = "bert-start"
const BERT_MENU = "bert-menu", 
      BERT_MENU_INTRO = "bert-menu-intro", 
      BERT_VILLAGERS = "bert-villagers",
      BERT_VILLAGER_NEEDS_HOUSE = "bert-vil-house",
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
        "Tradesmen! Knights! Worthless peons to scrub latrines and polish thy armor!",
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
    [BERT_VILLAGERS]: () => dialogueWithOptions(
        ["At present, only felonious peons can be spared by The King.",
        "Shall I return to The Kingdom, bringing word that thou art requesting a settler?"],
        DudeInteractIndicator.NONE,
        new DialogueOption("Bring me a criminal.", () => {
            const openHouses = LocationManager.instance.currentLocation.getElementsOfType(ElementType.HOUSE)
                    .map(e => e.entity.getComponent(House))
                    .filter(house => !house.hasResident())

            if (openHouses.length === 0) {
                return new NextDialogue(BERT_VILLAGER_NEEDS_HOUSE, true)
            }
            
            openHouses[0].setResidentPending() 
            EventQueue.instance.addEvent({
                type: QueuedEventType.HERALD_DEPARTURE,
                time: WorldTime.instance.time
            })
            return new NextDialogue(BERT_LEAVING, true)
        }),
        option("Never mind.", BERT_MENU_INTRO, false)
    ),
    [BERT_VILLAGER_NEEDS_HOUSE]: () => dialogue(
        ["Alas, thy settlement does not have appropriate lodging for a new settler.",
        "Return to me once thou hast constructed a home."],
        () => new NextDialogue(BERT_MENU_INTRO, false)
    ),
    [BERT_LEAVING]: () => dialogue(
        ["I shall return posthaste!"],
        () => new NextDialogue(BERT_MENU_INTRO, false)
    )
}