import { DialogueInstance, Dialogue, dialogue, NextDialogue, dialogueWithOptions, DialogueOption, option } from "../Dialogue"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SellMenu, SalePackage } from "../../ui/SellMenu"
import { Item } from "../../items/Items"

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

export const BERTO_INTRO_DIALOGUE: { [key: number]: () => DialogueInstance } = {
    [Dialogue.BERT_0]: () => dialogueWithOptions(
        ["Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII.",
        "Should thy choose to collect raw materials, I will purchase them on behalf of the kingdom.",
        "Upon receipt of a fee and construction of an appropriate dwelling, I can also bring tax-paying subjects to populate thy settlement.",
        "Tradesmen! Knights! Worthless peons to scrub latrines and polish thy armor!",
        "Art thou interested in any of my services at the moment?"],
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
        option("Sure!", Dialogue.BERT_MENU, true),
        option("Maybe later.", Dialogue.BERT_MENU, false),
    ),
    [Dialogue.BERT_MENU]: () => dialogueWithOptions(
        ["Tally-ho! How shall I assist thee?"],
        DudeInteractIndicator.NONE,
        new DialogueOption("What are you buying?", () => {
            SellMenu.instance.show(getItemsToSell())
            console.log("show menu")
            return new NextDialogue(Dialogue.BERT_MENU, false)
        }),
        option("Never mind.", Dialogue.BERT_MENU, false)
    )
}