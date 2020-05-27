import { Player } from "./Player"
import { Item } from "../items/Items"
import { Controls } from "../Controls"
import { LocationManager } from "../world/LocationManager"
import { ElementType } from "../world/elements/Elements"
import { SaveManager } from "../SaveManager"
import { EventQueue } from "../world/events/EventQueue"
import { QueuedEventType } from "../world/events/QueuedEvent"
import { WorldTime } from "../world/WorldTime"

export class DialogueInstance {
    readonly lines: string[]
    readonly next: () => void|NextDialogue
    readonly options: DialogueOption[]

    /**
     * @param lines Will be said one-by-one. TODO: Size restrictions based on UI
     * @param next Callback called once these lines finish. If present, options will be ignored. 
     *             If the function returns a NextDialogue object, it will be presented next.
     * @param options If any are provided, and next != null, will be prompted after the last line.
     *                Clicking an option will execute the corresponding function.
     *                If the function returns a Dialogue, that will then be prompted.
     */
    constructor(lines: string[], next: () => void|NextDialogue, options: DialogueOption[]) {
        this.lines = lines
        this.next = next
        this.options = options
    }
}

// Shorthand functions for creating dialogue
const dialogueWithOptions = (lines: string[], ...options: DialogueOption[]): DialogueInstance => { return new DialogueInstance(lines, () => {}, options) }
const dialogue = (lines: string[], next: () => void|NextDialogue = () => {}): DialogueInstance => { return new DialogueInstance(lines, next, []) } 
const option = (text: string, next: Dialogue, open: boolean = true): DialogueOption => {
    return new DialogueOption(text, () => new NextDialogue(next, open))
}

class DialogueOption {
    readonly text: string
    readonly next: () => void|NextDialogue

    constructor(text: string, next: () => void|NextDialogue) {
        this.text = text
        this.next = next
    }
}

export class NextDialogue {
    readonly dialogue: Dialogue
    readonly open: boolean

    constructor(dialogue: Dialogue, open: boolean = true) {
        this.dialogue = dialogue
        this.open = open
    }
}

export const enum Dialogue {
    DIP_0 = 1, DIP_1, DIP_2, DIP_3, DIP_BEFRIEND, DIP_MAKE_CAMPFIRE, DIP_ROCKS_RECEIVED, DIP_CAMPFIRE_DONE
}

export const getDialogue = (d: Dialogue): DialogueInstance => DIALOGUE_MAP[d]()

const ROCKS_NEEDED_FOR_CAMPFIRE = 10

const DIALOGUE_MAP: { [key: number]: () => DialogueInstance } = {
    [Dialogue.DIP_0]: () => dialogueWithOptions(
        ["Phew, thanks for your help! They almost had me. I thought for sure that those Orcs were gonna eat my butt."],
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
        "I'll put together a tent for you, if you collect rocks for a campfire.",
    ], () => new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false)),
    
    [Dialogue.DIP_MAKE_CAMPFIRE]: () => {
        if (Player.instance.dude.inventory.getItemCount(Item.ROCK) >= ROCKS_NEEDED_FOR_CAMPFIRE) {
            return dialogueWithOptions(
                [`It looks like you have enough rocks. Can I have ${ROCKS_NEEDED_FOR_CAMPFIRE} to make a campfire?`],
                option("<Give rocks>", Dialogue.DIP_ROCKS_RECEIVED),
                option("Not yet.", Dialogue.DIP_MAKE_CAMPFIRE, false)
            )
        } else {
            return dialogue([`We need ${ROCKS_NEEDED_FOR_CAMPFIRE} rocks to make a campfire. Try hitting big rocks with your sword!`], () => new NextDialogue(Dialogue.DIP_MAKE_CAMPFIRE, false))
        }
    },
    
    [Dialogue.DIP_ROCKS_RECEIVED]: () => {
        return dialogue(
            [`Great! Try placing the campfire down near my tent. You can open your inventory by pressing [${String.fromCharCode(Controls.inventoryButton)}].`], 
            () => {
                setTimeout(() => SaveManager.instance.save(), 500)
                Player.instance.dude.inventory.removeItem(Item.ROCK, ROCKS_NEEDED_FOR_CAMPFIRE)
                Player.instance.dude.inventory.addItem(Item.CAMPFIRE)
                return new NextDialogue(Dialogue.DIP_CAMPFIRE_DONE, false)
            }
        )
    },

    [Dialogue.DIP_CAMPFIRE_DONE]: () => {
        const campfires = LocationManager.instance.currentLocation.elements.values().filter(e => e.type === ElementType.CAMPFIRE)
        const dipTent = LocationManager.instance.currentLocation.elements.values().filter(e => e.type === ElementType.TENT)[0]
        if (campfires.length > 0) {
            Player.instance.dude.inventory.addItem(Item.TENT)
            const lines = [
                dipTent.occupiedPoints[0].distanceTo(campfires[0].occupiedPoints[0]) < 5
                        ? "That should keep up warm tonight!"
                        : "Well, the fire is a bit far from my tent, but that's okay!",
                "Here, I've finished putting together your tent. Find a nice spot and plop it down!"
            ]
            if (!campfires[0].save()["on"]) {
                lines.push(`By the way, you can light the fire by standing close to it and pressing [${Controls.keyString(Controls.interactButton)}].`)
            }
            return dialogue(lines, () => {  // TODO actually decide what should happen here
                EventQueue.instance.addEvent({
                    type: QueuedEventType.TRADER_ARRIVAL,
                    time: WorldTime.instance.future({ minutes: 10 })
                })
            })
        } else {
            return dialogue(["You should set up the campfire before it gets dark!"], () => new NextDialogue(Dialogue.DIP_CAMPFIRE_DONE, false))
        }
    },
}