import { controls } from "../../Controls"
import { getDipRecipes } from "../../items/CraftingRecipe"
import { Item } from "../../items/Items"
import { CraftingMenu } from "../../ui/CraftingMenu"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { ElementType } from "../../world/elements/Elements"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { here } from "../../world/locations/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { DudeType } from "../DudeType"
import {
    dialogue,
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    inv,
    NextDialogue,
    option,
    saveAfterDialogueStage,
} from "./Dialogue"

export const ROCKS_NEEDED_FOR_CAMPFIRE = 8
const CRAFT_OPTION = "<Craft>"

export const DIP_STARTING_DIALOGUE = "dip-0",
    DIP_ENTRYPOINT = "dip-6"
const DIP_1 = "dip-1",
    DIP_2 = "dip-2",
    DIP_3 = "dip-3",
    DIP_BEFRIEND = "dip-4",
    DIP_MAKE_CAMPFIRE = "dip-5",
    DIP_TENT_PLACED = "dip-7",
    DIP_UPGRADES = "dip-8"

export const DIP_INTRO_DIALOGUE: DialogueSet = {
    [DIP_STARTING_DIALOGUE]: () =>
        dialogueWithOptions(
            [
                "Phew, thanks for your help! They almost had me. I thought for sure that those Orcs were gonna eat my butt.",
            ],
            DudeInteractIndicator.IMPORTANT_DIALOGUE,
            option("Are you okay?", DIP_1),
            option("I expect a reward.", DIP_2),
            option("... Eat your butt?", DIP_3)
        ),

    [DIP_1]: () =>
        dialogue(
            ["I'm alright, just shaken up. You sure know how to handle that blade!"],
            () => new NextDialogue(DIP_BEFRIEND, true)
        ),
    [DIP_2]: () =>
        dialogue(
            ["I'm grateful, but I don't have much..."],
            () => new NextDialogue(DIP_BEFRIEND, true)
        ),
    [DIP_3]: () =>
        dialogue(
            [
                "Swamp Lizard butt is an Orcish delicacy. My species has been hunted to extinction by those savages. I'm the only one left.",
            ],
            () => new NextDialogue(DIP_BEFRIEND, true)
        ),

    [DIP_BEFRIEND]: () =>
        dialogue(
            [
                "You know, this is a very dangerous place. It's tough to survive without someone watching your back.",
                "How about I help you set up camp? I know this swamp better than anyone.",
                "I'll put together a tent for you, if you collect rocks and wood for a campfire.",
            ],
            () => new NextDialogue(DIP_MAKE_CAMPFIRE, false)
        ),

    [DIP_MAKE_CAMPFIRE]: () => {
        const campfires = here().getElementsOfType(ElementType.CAMPFIRE)
        const dipTent = here().getElementsOfType(ElementType.TENT)[0]
        if (campfires.length > 0) {
            // campfire has been placed
            const lines = [
                dipTent.pos.distanceTo(campfires[0].pos) < 5
                    ? "That should keep us warm tonight!"
                    : "Well, the fire is a bit far from my tent, but that's okay!",
                "It's important to keep your camp well-lit out here. There's no telling what danger lurks in the darkness...",
            ]
            if (campfires[0].save()["logs"] === 0) {
                lines.push(
                    `You can add logs to the fire by standing close to it and pressing ${controls.getInteractButtonString()}.`
                )
            }
            lines.push(
                "Here, I've finished putting together your tent. Find a nice spot and plop it down!"
            )
            return dialogue(
                lines,
                () => {
                    inv().addItem(Item.TENT, 1, { color: "blue" })
                    EventQueue.instance.addEvent({
                        type: QueuedEventType.NEW_VILLAGERS_ARRIVAL,
                        dudeTypes: [DudeType.HERALD],
                        time: WorldTime.instance.tomorrow(TimeUnit.HOUR * 7),
                    })
                    saveAfterDialogueStage()
                    return new NextDialogue(DIP_TENT_PLACED, false)
                },
                DudeInteractIndicator.IMPORTANT_DIALOGUE
            )
        } else if (inv().getItemCount(Item.CAMPFIRE) > 0) {
            // campfire has been crafted
            return dialogue(
                [
                    `Try placing the campfire down near my tent. You can open your inventory by pressing ${controls.getInventoryButtonString()}.`,
                ],
                () => new NextDialogue(DIP_MAKE_CAMPFIRE, false)
            )
        } else if (inv().getItemCount(Item.ROCK) >= ROCKS_NEEDED_FOR_CAMPFIRE) {
            // can craft
            return dialogueWithOptions(
                [
                    `It looks like you have enough rocks and wood. Should we put together a campfire?`,
                ],
                DudeInteractIndicator.IMPORTANT_DIALOGUE,
                new DialogueOption(CRAFT_OPTION, () => {
                    CraftingMenu.instance.open(getDipRecipes())
                    return new NextDialogue(DIP_MAKE_CAMPFIRE, false)
                }),
                option("Not yet.", DIP_MAKE_CAMPFIRE, false)
            )
        } else {
            // do not have enough ingredients to craft
            return dialogue(
                [
                    `We need ${ROCKS_NEEDED_FOR_CAMPFIRE} rocks and some wood to make a campfire. Try hitting big rocks and trees with your sword!`,
                ],
                () => new NextDialogue(DIP_MAKE_CAMPFIRE, false)
            )
        }
    },

    [DIP_TENT_PLACED]: () => {
        const tents = here().getElementsOfType(ElementType.TENT)
        if (tents.length < 2) {
            return dialogue(
                [
                    `You should put down your tent before it gets dark! You can open your inventory by pressing ${controls.getInventoryButtonString()}.`,
                ],
                () => new NextDialogue(DIP_TENT_PLACED, false)
            )
        }
        return dialogue(
            [
                "We'll want to keep the fire burning all night long. Hungry spirits roam the swamp once the sun sets, but they stay in the darkness.",
                "You can rest in your tent or at the campfire to pass time, as long as the camp is well-lit. Resting will heal you, but it can also put the camp at risk of attack.",
                "You should collect more resources so we can improve our camp. If you grab a torch from a burning campfire, you'll be able to light your way.",
                "Be careful though — torches don't stay lit for long. If you're willing to brave the darkness, there are many things that can only be found at night!",
                "One last thing — I can also help make you some basic tools and utilities, if you bring me the necessary resources. Good luck!",
            ],
            () => new NextDialogue(DIP_ENTRYPOINT, false),
            DudeInteractIndicator.IMPORTANT_DIALOGUE
        )
    },

    [DIP_ENTRYPOINT]: () => {
        // TODO: If there are no buildings yet, explain the upgrade process

        return dialogueWithOptions(
            ["Can I help you make something?"],
            DudeInteractIndicator.NONE,
            new DialogueOption(CRAFT_OPTION, () => {
                CraftingMenu.instance.open(getDipRecipes())
                return new NextDialogue(DIP_ENTRYPOINT, false)
            }),
            // new DialogueOption("I want to upgrade a building.", () => {
            //     CraftingMenu.instance.open(getDipRecipes())
            //     return new NextDialogue(DIP_UPGRADES, false)
            // }),
            // TODO: Add town upgrades option
            option(getExitText(), DIP_ENTRYPOINT, false)
        )
    },

    [DIP_UPGRADES]: () => {
        return dialogueWithOptions(
            ["Can I help you make something?"],
            DudeInteractIndicator.NONE,
            new DialogueOption(CRAFT_OPTION, () => {
                CraftingMenu.instance.open(getDipRecipes())
                return new NextDialogue(DIP_ENTRYPOINT, false)
            }),
            // TODO: Add town upgrades option
            option(getExitText(), DIP_ENTRYPOINT, false)
        )
    },
}
