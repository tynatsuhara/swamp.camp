import { DialogueInstance, dialogueWithOptions, Dialogue, dialogue, option, NextDialogue, saveAfterDialogueStage, DialogueOption, inv } from "../Dialogue"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Item } from "../../items/Items"
import { Controls } from "../../Controls"
import { LocationManager } from "../../world/LocationManager"
import { ElementType } from "../../world/elements/Elements"
import { EventQueue } from "../../world/events/EventQueue"
import { QueuedEventType } from "../../world/events/QueuedEvent"
import { WorldTime } from "../../world/WorldTime"
import { CraftingMenu } from "../../ui/CraftingMenu"
import { getDipRecipes } from "../../items/CraftingRecipe"

export const ROCKS_NEEDED_FOR_CAMPFIRE = 10
export const WOOD_NEEDED_FOR_CAMPFIRE = 5
const CRAFT_OPTION = "<Craft>"

// TODO: make DIP introduce himself, have player input their name

export const DIP_INTRO_DIALOGUE: { [key: number]: () => DialogueInstance } = {
    [Dialogue.DIP_0]: () => dialogueWithOptions(
        ["Phew, thanks for your help! They almost had me. I thought for sure that those Orcs were gonna eat my butt."],
        DudeInteractIndicator.IMPORTANT_DIALOGUE,
        option("Are you okay?", Dialogue.DIP_1),
        option("I expect a reward.", Dialogue.DIP_2),
        option("... Eat your butt?", Dialogue.DIP_3),
    ),

    [Dialogue.DIP_1]: () => dialogue(["I'm alright, just shaken up. You sure know how to handle that blade!"], () => new NextDialogue(Dialogue.DIP_BEFRIEND)),
    [Dialogue.DIP_2]: () => dialogue(["I'm grateful, but I don't have much..."], () => new NextDialogue(Dialogue.DIP_BEFRIEND)),
    [Dialogue.DIP_3]: () => dialogue(["Swamp Lizard butt is an Orcish delicacy. My species has been hunted to extinction by those savages. I'm the only one left."], () => new NextDialogue(Dialogue.DIP_BEFRIEND)),
    
    [Dialogue.DIP_BEFRIEND]: () => dialogue([
        "You know, this is a very dangerous place. It's tough to survive without someone watching your back.",
        "How about I help you set up camp? I know these woods better than anyone.",
        "I'll put together a tent for you, if you collect rocks and wood for a campfire.",
    ], () => new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false)),
    
    [Dialogue.DIP_MAKE_CAMPFIRE]: () => {
        const campfires = LocationManager.instance.currentLocation.elements.values().filter(e => e.type === ElementType.CAMPFIRE)
        const dipTent = LocationManager.instance.currentLocation.elements.values().filter(e => e.type === ElementType.TENT)[0]
        if (campfires.length > 0) {  // campfire has been placed
            const lines = [
                dipTent.occupiedPoints[0].distanceTo(campfires[0].occupiedPoints[0]) < 5
                        ? "That should keep us warm tonight!"
                        : "Well, the fire is a bit far from my tent, but that's okay!",
                "Here, I've finished putting together your tent. Find a nice spot and plop it down!"
            ]
            if (campfires[0].save()["logs"] === 0) {
                lines.push(`By the way, you can add logs to the fire by standing close to it and pressing [${Controls.keyString(Controls.interactButton)}].`)
            }
            return dialogue(lines, () => {  // TODO actually decide what should happen here
                inv().addItem(Item.TENT)
                EventQueue.instance.addEvent({
                    type: QueuedEventType.TRADER_ARRIVAL,
                    time: WorldTime.instance.future({ minutes: 10 })
                })
                saveAfterDialogueStage()
            }, DudeInteractIndicator.IMPORTANT_DIALOGUE)
        } else if (inv().getItemCount(Item.CAMPFIRE) > 0) {  // campfire has been crafted
            return dialogue(
                [`Try placing the campfire down near my tent. You can open your inventory by pressing [${String.fromCharCode(Controls.inventoryButton)}].`], 
                () =>  new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false)
            )
        } else if (inv().getItemCount(Item.ROCK) >= ROCKS_NEEDED_FOR_CAMPFIRE && inv().getItemCount(Item.WOOD) >= WOOD_NEEDED_FOR_CAMPFIRE) {  // can craft
            return dialogueWithOptions(
                [`It looks like you have enough rocks and wood. Should we put together a campfire?`],
                DudeInteractIndicator.IMPORTANT_DIALOGUE,
                new DialogueOption(CRAFT_OPTION, () => {
                    CraftingMenu.instance.show(getDipRecipes())
                    return new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false)
                }),
                option("Not yet.", Dialogue.DIP_MAKE_CAMPFIRE, false)
            )
        } else {  // do not have enough ingredients to craft
            return dialogue(
                [`We need ${ROCKS_NEEDED_FOR_CAMPFIRE} rocks and ${WOOD_NEEDED_FOR_CAMPFIRE} wood to make a campfire. Try hitting big rocks and trees with your sword!`], 
                () => new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false)
            )
        }
    },
}