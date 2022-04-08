import { Item } from "../../items/Items"
import { saveManager } from "../../SaveManager"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { SalePackage, TradeMenu } from "../../ui/TradeMenu"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { here } from "../../world/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { TaxRate } from "../../world/TaxRate"
import { WorldTime } from "../../world/WorldTime"
import { DudeType } from "../DudeFactory"
import { Berto } from "../types/Berto"
import {
    dialogue,
    DialogueInstance,
    DialogueOption,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
} from "./Dialogue"

export const BERTO_STARTING_DIALOGUE = "bert-start"
const BERT_MENU = "bert-menu",
    BERT_ENTRYPOINT = "bert-menu-intro",
    BERT_VILLAGERS = "bert-villagers",
    BERT_LEAVING = "bert-leaving",
    BERT_TAXES = "bert-taxes",
    BERT_TAXES_UPDATED = "bert-taxes-updated"

const getItemsToSell = (): SalePackage[] => {
    return [
        {
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
        },
    ]
}

const getGreeting = () => {
    return "Tally ho!"
}

export const BERTO_INTRO_DIALOGUE: { [key: string]: () => DialogueInstance } = {
    [BERTO_STARTING_DIALOGUE]: () =>
        dialogueWithOptions(
            [
                "Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of The Honourable King Bob XVIII.",
                "Should thy choose to collect raw materials, I will purchase them on behalf of the Kingdom.",
                "Upon receipt of a fee and construction of an appropriate dwelling, I can also bring tax-paying subjects to populate thy settlement.",
                "Tradesmen! Knights! Worthless peons to scrub latrines and polish thine armor!",
                "Art thou interested in any of my services at the moment?",
            ],
            DudeInteractIndicator.IMPORTANT_DIALOGUE,
            option("Sure!", BERT_MENU, true),
            option("Maybe later.", BERT_ENTRYPOINT, false)
        ),
    [BERT_ENTRYPOINT]: () => dialogue([getGreeting()], () => new NextDialogue(BERT_MENU, true)),
    [BERT_MENU]: () => {
        const options = [
            new DialogueOption("What are you buying?", () => {
                TradeMenu.instance.sell(getItemsToSell())
                return new NextDialogue(BERT_ENTRYPOINT, false)
            }),
            new DialogueOption("We need a new settler.", () => {
                return new NextDialogue(BERT_VILLAGERS, true)
            }),
        ]
        if (saveManager.getState().hasRecruitedAnyVillagers) {
            options.push(
                new DialogueOption("Let's talk taxes.", () => new NextDialogue(BERT_TAXES, true))
            )
        }
        return dialogueWithOptions(
            ["How shall I assist thee?"],
            DudeInteractIndicator.NONE,
            ...options,
            option(getExitText(), BERT_ENTRYPOINT, false)
        )
    },
    [BERT_VILLAGERS]: () => fetchNpcDialogue(),
    [BERT_LEAVING]: () => {
        let txt = ["I shall return posthaste!"]
        if (!saveManager.getState().hasRecruitedAnyVillagers) {
            txt = [
                "I shall return posthaste with thine first settler!",
                "Upon my return, thou shalt have the option to establish a tax upon thy residents.",
            ]
        }
        return dialogue(txt, () => {
            saveManager.setState({ hasRecruitedAnyVillagers: true })
            return new NextDialogue(BERT_ENTRYPOINT, false)
        })
    },
    [BERT_TAXES]: () => adjustTaxRateDialogue(),
    [BERT_TAXES_UPDATED]: () =>
        dialogue(
            [
                saveManager.getState().taxRate === TaxRate.NONE
                    ? "Henceforth, taxes shall no longer be collected."
                    : "The new rate shall be communicated to all settlers and collected henceforth.",
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        ),
}

const fetchNpcDialogue = (): DialogueInstance => {
    const allResidences = here()
        .getElements()
        .flatMap((e) => e.entity.getComponents(Residence))

    const houseableTypes = [DudeType.VILLAGER, DudeType.NUN, DudeType.CLERIC]

    const residenceMap = houseableTypes.reduce((map, type) => {
        const r = allResidences.filter((residence) => residence?.hasCapacity(type))
        if (r.length > 0) {
            map.set(type, r)
        }
        return map
    }, new Map<DudeType, Residence[]>())

    if (residenceMap.size === 0) {
        return dialogue(
            [
                "Alas, thy settlement does not have appropriate lodging for a new settler.",
                "Return to me once thou hast constructed a dwelling.",
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        )
    }

    const fetchNpc = (type: DudeType) => () => {
        residenceMap.get(type)[0].setResidentPending()
        EventQueue.instance.addEvent({
            type: QueuedEventType.HERALD_DEPARTURE_CHECK,
            time: WorldTime.instance.time,
            dudeTypes: [type],
        })
        here().getDude(DudeType.HERALD).entity.getComponent(Berto).updateSchedule()
        return new NextDialogue(BERT_LEAVING, true)
    }

    const introText = [
        // "Thy camp contains suitable domiciles for several occupations.",
        "Which class of settler dost thy request I procure from the Kingdom?",
    ]
    const options: DialogueOption[] = []

    if (residenceMap.get(DudeType.VILLAGER)) {
        options.push(new DialogueOption("Bring me a convict.", fetchNpc(DudeType.VILLAGER)))
        // if (residenceMap.size === 1) {
        //     introText = [
        //         "At present, only felonious peons can be spared by The King.",
        //         "Shall I return to the Kingdom, bringing word that thou art requesting a settler?",
        //     ]
        // }
    }

    if (residenceMap.get(DudeType.NUN)) {
        options.push(new DialogueOption("The church needs a new nun.", fetchNpc(DudeType.NUN)))
    }

    if (residenceMap.get(DudeType.CLERIC)) {
        options.push(new DialogueOption("The church requires a cleric.", fetchNpc(DudeType.CLERIC)))
    }

    options.push(option(getExitText(), BERT_ENTRYPOINT, false))

    return dialogueWithOptions(introText, DudeInteractIndicator.NONE, ...options)
}

const adjustTaxRateDialogue = (): DialogueInstance => {
    const currentRate = saveManager.getState().taxRate
    console.log("current rate " + currentRate)
    const rateText = ["at zero", "low", "moderate", "high", "very high"]

    const setTaxRateOption = (taxRate: TaxRate) =>
        new DialogueOption(
            taxRate === TaxRate.NONE ? "Don't collect taxes." : `Make it ${rateText[taxRate]}.`,
            () => {
                saveManager.setState({ taxRate })
                return new NextDialogue(BERT_TAXES_UPDATED, true)
            }
        )

    const options = [
        TaxRate.NONE,
        TaxRate.LOW,
        TaxRate.MODERATE,
        TaxRate.HIGH,
        TaxRate.VERY_HIGH,
    ].map((rate) => setTaxRateOption(rate))

    // don't show the current option
    options.splice(currentRate, 1)

    options.push(option(`Keep it ${rateText[currentRate]}.`, BERT_ENTRYPOINT, false))

    return dialogueWithOptions(
        [
            `${
                currentRate === TaxRate.NONE
                    ? "Presently, thou art not collecting taxes from thy settlers."
                    : `Presently, the tax rate is ${rateText[currentRate]}.`
            } Dost thou wish to adjust it?`,
        ],
        DudeInteractIndicator.NONE,
        ...options
    )
}
