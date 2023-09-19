import { saveManager } from "../../core/SaveManager"
import { Item } from "../../items/Item"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { TextIcon } from "../../ui/Text"
import { SalePackage, TradeMenu } from "../../ui/TradeMenu"
import { UISounds } from "../../ui/UISounds"
import { TaxRate } from "../../world/TaxRate"
import { WorldTime } from "../../world/WorldTime"
import { ElementType } from "../../world/elements/ElementType"
import { Queequeg } from "../../world/elements/Queequeg"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { LocationManager, camp } from "../../world/locations/LocationManager"
import { Residence } from "../../world/residences/Residence"
import { DudeType } from "../DudeType"
import { player } from "../player"
import { Berto } from "../types/Berto"
import { getAnnouncementDialogue } from "./Announcements"
import {
    DialogueInstance,
    DialogueOption,
    DialogueSet,
    NextDialogue,
    dialogue,
    dialogueWithOptions,
    getExitText,
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
    BERT_ANNOUNCEMENTS = "bert-announcements",
    BERTO_WAITING_FOR_TOWN_HALL = "bert-town-hall"

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

// https://academia.com.sg/basics-of-shakespeare-pronouns/ lol

export const BERTO_INTRO_DIALOGUE: DialogueSet = {
    [BERTO_STARTING_DIALOGUE]: () => {
        if (!player().inventory.canAddItem(Item.TOWN_HALL)) {
            return // rare case, this dialogue is unavailable if there's no inventory space
        }
        return dialogue(
            [
                `Good morrow! I, Sir Berto of Dube, present myself unto thee as an emissary of ${KING_NAME}.`,
                "Whilst your Excellency clearly excels at adventuring and slaughtering beasts, mine own expertise lies in the logistics of governing settlements.",
                "As thy subjects work to collect raw resources, I shall facilitate the transport and appropriate payment for such items on behalf of the kingdom.",
                "Upon construction of dwellings, I can send for tax-paying subjects to populate thy settlement.",
                "Tradesmen! Knights! Worthless peons to build homes, scrub latrines, and polish thine armor!",
                "Before we endeavor to grow this settlement, thou needeth establish an official town hall to handle administrative filings.",
                "I present to thee, Royal Construction Cones. Plop these upon the land where thou see fit to erect the town hall!",
            ],
            () => {
                player().inventory.addItem(Item.TOWN_HALL)
                return new NextDialogue(BERTO_WAITING_FOR_TOWN_HALL, false)
            },
            InteractIndicator.IMPORTANT_DIALOGUE
        )
    },
    [BERTO_WAITING_FOR_TOWN_HALL]: () => {
        const hasPlacedTownHall = !!camp().getElementOfType(ElementType.TOWN_HALL)
        if (!hasPlacedTownHall) {
            return dialogue(
                [
                    "Return to me once thou hast placed the Royal Construction Cones for the town hall using the plan in your inventory.",
                ],
                () => new NextDialogue(BERTO_WAITING_FOR_TOWN_HALL, false),
                InteractIndicator.NONE
            )
        }
        return dialogueWithOptions(
            [
                "An exemplary choice of location! The town hall shall shine like a heavenly beacon of light in this shit-ish swamp.",
                "Thy next order should be to recruit workers to begin construction.",
                "Until they arrive, gathering resources for construction would be well-advised.",
                "I wish I could help, but alas, I have the soft hands of a life-long bureaucrat.",
                "Once the town hall is constructed, I shall take up residence there... In the meantime, I'm sure thy tent has room for one more.",
                "Now, wouldst thou desire for me to send for an order of menial labourers?",
            ],
            InteractIndicator.IMPORTANT_DIALOGUE,
            option("Sure!", BERT_VILLAGERS, true),
            option("Maybe later.", BERT_ENTRYPOINT, false)
        )
    },
    [BERT_ENTRYPOINT]: () => {
        return dialogue(
            [getGreeting()],
            () => new NextDialogue(BERT_MENU, true),
            Berto.instance.hasAnnouncements()
                ? InteractIndicator.IMPORTANT_DIALOGUE
                : InteractIndicator.NONE
        )
    },
    [BERT_MENU]: () => {
        // Show announcements before anything else
        if (Berto.instance.hasAnnouncements()) {
            return redirectDialogue(() => new NextDialogue(BERT_ANNOUNCEMENTS, true))
        }

        const options = []
        const { hasTownHall, hasRecruitedAnyVillagers } = saveManager.getState()

        // selling
        if (hasTownHall) {
            options.push(
                new DialogueOption("What is the kingdom buying?", () => {
                    TradeMenu.instance.sell(getItemsToSell())
                    return new NextDialogue(BERT_ENTRYPOINT, false)
                }),
                new DialogueOption("What is the kingdom selling?", () => {
                    TradeMenu.instance.buy(getItemsForSale())
                    return new NextDialogue(BERT_ENTRYPOINT, false)
                })
            )
        }

        // recruiting villagers
        options.push(
            new DialogueOption("We need more settlers.", () => {
                return new NextDialogue(BERT_VILLAGERS, true)
            })
        )

        // managing taxes
        if (hasTownHall && hasRecruitedAnyVillagers) {
            options.push(
                new DialogueOption("Let's talk taxes.", () => new NextDialogue(BERT_TAXES, true))
            )
        }

        return dialogueWithOptions(
            ["Now, how shall I assist thee?"],
            InteractIndicator.NONE,
            ...options,
            option(getExitText(), BERT_ENTRYPOINT, false)
        )
    },
    [BERT_VILLAGERS]: () => fetchNpcDialogue(),
    [BERT_REQUEST_CONVICTS]: () => fetchConvictsDialogue(),
    [BERT_VILLAGERS_REQUESTED]: () => {
        const txt = ["I shall send word of thy request to the kingdom."]
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
        const a = Berto.instance.getAnnouncements()[0]
        if (!a) {
            // This probably shouldn't ever happen
            return dialogue(["Alas, I have no announcements at the moment."])
        }
        return getAnnouncementDialogue(a, () => {
            Berto.instance.shiftAnnouncement()
            return new NextDialogue(BERT_MENU, true)
        })
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

    const introText = saveManager.getState().hasRecruitedAnyVillagers
        ? [
              // "Thy camp contains suitable domiciles for several occupations.",
              "Which class of settler dost thy request I procure from the kingdom?",
          ]
        : [
              "The kingdom has an extensive supply of expendable prisoners, who are already accustomed to living in squalor.",
              `${KING_NAME} has graciously offered thy first shipment of prisoners free of charge.`,
              `Most importantly, the colony shan't be required to provide payment for their services!`,
              "For subsequent shipments of settlers, thou shall only be asked to pay a small transportation fee.",
              "Shall I send for thy first shipment of settlers?",
          ]

    const options: DialogueOption[] = [
        new DialogueOption(`Bring me some convicts.`, () => {
            return new NextDialogue(BERT_REQUEST_CONVICTS, true)
        }),
    ]

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
                "At present, too many of thy subjects are sleeping in the mud. It's a bad look.",
                "Once thou hast constructed some residences, return to me to resume importing workers.",
            ],
            () => new NextDialogue(BERT_ENTRYPOINT, false)
        )
    }

    const completeOrder = () => {
        if (villagerCost != 0) {
            UISounds.playMoneySound()
            saveManager.setState({ coins: saveManager.getState().coins - villagerCost })
        }
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
            } Dost thou wish to adjust the rate?`,
        ],
        InteractIndicator.NONE,
        ...options
    )
}

const getItemsForSale = (): SalePackage[] => {
    // TODO: How should we determine when a church can be built?
    //       Instead of doing it like this, there should be a canBuildChurch
    //       flag and Berto should deliver an announcement

    // const houses = camp()
    //     .getElementsOfType(ElementType.HOUSE)
    //     .flatMap((h) => h.entity.getComponents(Residence))

    // if (houses.length >= 3 && houses.every((h) => h.getResidents().length > 0)) {
    //     buildings.recipes.push({
    //         desc: "Church",
    //         output: Item.CHURCH,
    //         input: [new ItemStack(Item.ROCK, 5), new ItemStack(Item.WOOD, 5)],
    //     })
    // }

    return [
        {
            item: Item.MINE_ENTRANCE,
            count: 1,
            price: 10,
        },
        // TODO: House details (house multiple convicts?) — probably call it "workers' quarters"
        {
            item: Item.HOUSE,
            count: 1,
            price: 10,
        },
    ]
}
