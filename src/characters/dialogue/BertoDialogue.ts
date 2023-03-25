import { Item } from "../../items/Item"
import { saveManager } from "../../SaveManager"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { TextIcon } from "../../ui/Text"
import { SalePackage, TradeMenu } from "../../ui/TradeMenu"
import { Queequeg } from "../../world/elements/Queequeg"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { camp, LocationManager } from "../../world/locations/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { TaxRate } from "../../world/TaxRate"
import { WorldTime } from "../../world/WorldTime"
import { DudeType } from "../DudeType"
import { Berto } from "../types/Berto"
import { getAnnouncementDialogue } from "./Announcements"
import {
    dialogue,
    DialogueInstance,
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
    redirectDialogue,
} from "./Dialogue"

export const BERTO_STARTING_DIALOGUE = "bert-start"
const BERT_MENU = "bert-menu",
    BERT_ENTRYPOINT = "bert-menu-intro",
    BERT_VILLAGERS = "bert-villagers",
    BERT_REQUEST_CONVICTS = "bert-workers",
    BERT_VILLAGERS_REQUESTED = "bert-vill-req",
    BERT_TAXES = "bert-taxes",
    BERT_TAXES_UPDATED = "bert-taxes-updated",
    BERT_ANNOUNCEMENTS = "bert-announcements"

const KING_NAME = "The Honourable King Bob XVIII"

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

export const BERTO_INTRO_DIALOGUE: DialogueSet = {
    [BERTO_STARTING_DIALOGUE]: () =>
        dialogueWithOptions(
            [
                `Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of ${KING_NAME}.`,
                "Whilst your Excellency clearly excels at adventuring and slaughtering beasts, mine own expertise lies in the logistics of governing settlements.",
                "As thy subjects work to collect raw resources, I shall facilitate the transport and appropriate payment for such items on behalf of the Kingdom.",
                "Upon construction of dwellings, I can send for tax-paying subjects to populate thy settlement.",
                "Tradesmen! Knights! Worthless peons to build homes, scrub latrines, and polish thine armor!",
                "Art thou interested in any of my services at the moment?",
            ],
            InteractIndicator.IMPORTANT_DIALOGUE,
            option("Sure!", BERT_MENU, true),
            option("Maybe later.", BERT_ENTRYPOINT, false)
        ),
    [BERT_ENTRYPOINT]: () => {
        const announcements = Berto.instance.getAnnouncements()
        return dialogue(
            [getGreeting()],
            () => new NextDialogue(BERT_MENU, true),
            announcements.length > 0 ? InteractIndicator.IMPORTANT_DIALOGUE : InteractIndicator.NONE
        )
    },
    [BERT_MENU]: () => {
        const options = []
        const announcements = Berto.instance.getAnnouncements()
        if (announcements.length > 0) {
            options.push(
                new DialogueOption(
                    "What news is there?",
                    () => new NextDialogue(BERT_ANNOUNCEMENTS, true)
                )
            )
        }
        options.push(
            new DialogueOption("What is the Kingdom buying?", () => {
                TradeMenu.instance.sell(getItemsToSell())
                return new NextDialogue(BERT_ENTRYPOINT, false)
            }),
            new DialogueOption("We need more settlers.", () => {
                return new NextDialogue(BERT_VILLAGERS, true)
            })
        )
        if (saveManager.getState().hasRecruitedAnyVillagers) {
            options.push(
                new DialogueOption("Let's talk taxes.", () => new NextDialogue(BERT_TAXES, true))
            )
        }
        return dialogueWithOptions(
            ["How shall I assist thee?"],
            InteractIndicator.NONE,
            ...options,
            option(getExitText(), BERT_ENTRYPOINT, false)
        )
    },
    [BERT_VILLAGERS]: () => fetchNpcDialogue(),
    [BERT_REQUEST_CONVICTS]: () => fetchConvictsDialogue(),
    [BERT_VILLAGERS_REQUESTED]: () => {
        const txt = ["I shall send word of your request to the Kingdom."]
        if (!saveManager.getState().hasRecruitedAnyVillagers) {
            txt.push(
                "Once thy new subjects arrive, return to me to establish a tax upon thy residents."
            )
        }
        return dialogue(txt, () => {
            Queequeg.instance.depart()
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
    [BERT_ANNOUNCEMENTS]: () => {
        const a = Berto.instance.shiftAnnouncement()
        if (!a) {
            // This probably shouldn't ever happen
            return dialogue(["Alas, I have no announcements at the moment."])
        }
        return getAnnouncementDialogue(a, () => new NextDialogue(BERT_ENTRYPOINT, false))
    },
}

const fetchNPCs = (...types: DudeType[]) => {
    EventQueue.instance.addEvent({
        type: QueuedEventType.NEW_VILLAGERS_ARRIVAL,
        time: WorldTime.instance.future({ hours: 24 }),
        dudeTypes: types,
    })
}

const fetchNpcDialogue = (): DialogueInstance => {
    if (!Queequeg.instance.isDocked) {
        return dialogue(
            [
                "Our ship has already departed for the mainland. I shall not be addressing any immigration concerns until it has returned.",
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        )
    }

    let introText = [
        // "Thy camp contains suitable domiciles for several occupations.",
        "Which class of settler dost thy request I procure from the Kingdom?",
    ]
    if (!saveManager.getState().hasRecruitedAnyVillagers) {
        introText = [
            "To begin thy quest to settle this land, thou shalt require the hands of menial labourers.",
            "The Kingdom has an extensive supply of expendable prisoners, who are already accustomed to living in rough conditions.",
            `${KING_NAME} has graciously offered thy first shipment of prisoners free of charge.`,
            "For subsequent shipments, thou shall only be asked to pay a small transportation fee.",
            "Shall I send for thy first shipment of settlers?",
        ]
    }
    const options: DialogueOption[] = []

    options.push(
        new DialogueOption(`Bring me some convicts.`, () => {
            return new NextDialogue(BERT_REQUEST_CONVICTS, true)
        })
    )

    // TODO fix this for residence type villagers

    // const allResidences = here()
    //     .getElements()
    //     .flatMap((e) => e.entity.getComponents(Residence))

    // const houseableTypes = [DudeType.VILLAGER, DudeType.NUN, DudeType.CLERIC]

    // // Residences with capacity for each type
    // const residenceMap = houseableTypes.reduce((map, type) => {
    //     const r = allResidences.filter((residence) => residence?.hasCapacity(type))
    //     if (r.length > 0) {
    //         map.set(type, r)
    //     }
    //     return map
    // }, new Map<DudeType, Residence[]>())

    // if (residenceMap.size === 0) {
    //     return dialogue(
    //         [
    //             "Alas, thy settlement does not have appropriate lodging for a new settler.",
    //             "Return to me once thou hast constructed a dwelling.",
    //         ],
    //         () => new NextDialogue(BERT_ENTRYPOINT, false)
    //     )
    // }

    // const fetchNPCWithResidence = (type: DudeType) => () => {
    //     residenceMap.get(type)[0].setResidentPending(type)
    //     fetchNPCs(type)
    //     return new NextDialogue(BERT_LEAVING, true)
    // }

    // if (residenceMap.get(DudeType.NUN)) {
    //     options.push(
    //         new DialogueOption("The church needs a new nun.", fetchNPCWithResidence(DudeType.NUN))
    //     )
    // }

    // if (residenceMap.get(DudeType.CLERIC)) {
    //     options.push(
    //         new DialogueOption(
    //             "The church requires a cleric.",
    //             fetchNPCWithResidence(DudeType.CLERIC)
    //         )
    //     )
    // }

    options.push(option(getExitText(), BERT_ENTRYPOINT, false))

    return dialogueWithOptions(introText, InteractIndicator.NONE, ...options)
}

const fetchConvictsDialogue = (): DialogueInstance => {
    let villagerCost = 5
    if (!saveManager.getState().hasRecruitedAnyVillagers) {
        villagerCost = 0
    }

    if (saveManager.getState().coins < villagerCost) {
        return dialogue(
            [
                "The settlement's coffers are a wee bit bare at the moment.",
                `You'll need at least ${TextIcon.COIN}${villagerCost} to procure a shipment of workers.`,
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        )
    }

    const homedVillagerUUIDs = new Set(
        camp()
            .getElements()
            .flatMap((e) => e.entity.getComponents(Residence))
            .flatMap((res) => res.getResidentUUIDs())
    )

    const homelessVillagers = LocationManager.instance
        .getLocations()
        .flatMap((l) => l.getDudes())
        .filter((d) => d.type === DudeType.VILLAGER)
        .filter((d) => !homedVillagerUUIDs.has(d.uuid))

    const canGetMoreGenericVillagers = homelessVillagers.length < 10

    if (!canGetMoreGenericVillagers) {
        return dialogue(
            [
                "At present, too many of thy subjects are sleeping in the mud.",
                "Once thou hast constructed some residences, return to me to resume importing workers.",
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        )
    }

    const completeOrder = () => {
        // TODO play gold clink noise
        saveManager.setState({ coins: saveManager.getState().coins - villagerCost })
        fetchNPCs(DudeType.VILLAGER, DudeType.VILLAGER, DudeType.VILLAGER)
        return new NextDialogue(BERT_VILLAGERS_REQUESTED, true)
    }

    if (villagerCost === 0) {
        return redirectDialogue(completeOrder)
    }

    return dialogueWithOptions(
        [`Art thou willing to pay the fee of ${TextIcon.COIN}${villagerCost} for shipment?`],
        InteractIndicator.NONE,
        new DialogueOption("Yes.", completeOrder),
        option(getExitText(), BERT_ENTRYPOINT, false)
    )
}

const adjustTaxRateDialogue = (): DialogueInstance => {
    const currentRate = saveManager.getState().taxRate
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
        InteractIndicator.NONE,
        ...options
    )
}
