import { Item } from "../../items/Items"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Bed } from "../../world/elements/Bed"
import { Campfire } from "../../world/elements/Campfire"
import { here } from "../../world/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { Player } from "../Player"
import { ShieldType } from "../weapons/ShieldType"
import {
    dialogue,
    DialogueInstance,
    DialogueOption,
    dialogueWithOptions,
    NextDialogue,
} from "./Dialogue"

export const CAMPFIRE_DIALOGUE = "campfire"
export const BED_DIALOGUE = "bed"

const CANCEL_TEXT = "Leave"

export const ITEM_DIALOGUES: { [key: string]: () => DialogueInstance } = {
    [CAMPFIRE_DIALOGUE]: () => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full

        const cf: Campfire = DialogueDisplay.instance.source as Campfire
        const logCount = cf.logs
        const playerLogCount = Player.instance.dude.inventory.getItemCount(Item.WOOD)
        const logsYouCanAdd = Math.min(Campfire.LOG_CAPACITY - logCount, playerLogCount)

        const completeDialogue = (logsTransferred: number) => {
            return () => {
                if (logsTransferred > 0) {
                    Player.instance.dude.inventory.removeItem(Item.WOOD, logsTransferred)
                }
                cf.addLogs(logsTransferred)
                return new NextDialogue(CAMPFIRE_DIALOGUE, false)
            }
        }

        const takeLogOption = new DialogueOption("Take a torch", () => {
            Player.instance.dude.setShield(ShieldType.TORCH)
            return completeDialogue(-1)()
        })

        // TODO make sure the player can always take a log if possible

        if (logsYouCanAdd === 0) {
            return dialogueWithOptions(
                [
                    playerLogCount === 0
                        ? "You don't have any logs to add to the fire."
                        : "The fire already has the maximum amount of logs.",
                ],
                DudeInteractIndicator.NONE,
                logCount > 0 ? takeLogOption : null,
                new DialogueOption(CANCEL_TEXT, completeDialogue(0))
            )
        } else if (logsYouCanAdd === 1) {
            return dialogueWithOptions(
                [
                    playerLogCount === 1
                        ? "You only have one log to add to the fire."
                        : "You can fit one more log in the fire.",
                ],
                DudeInteractIndicator.NONE,
                new DialogueOption("Add a log", completeDialogue(1)),
                takeLogOption,
                new DialogueOption(CANCEL_TEXT, completeDialogue(0))
            )
        }

        let prompt: string
        if (logCount === 1) {
            prompt = `The fire will go out soon. You can add up to ${logsYouCanAdd} more logs right now.`
        } else if (logCount === 0) {
            prompt = `Add logs to ignite the fire? You can add up to ${logsYouCanAdd} logs.`
        } else {
            prompt = `The fire will burn for at least ${
                (logCount - 1) * Campfire.LOG_DURATION_HOURS
            } more hours. You can add up to ${logsYouCanAdd} more logs right now.`
        }

        const options = [
            new DialogueOption(`Add ${logsYouCanAdd} logs`, completeDialogue(logsYouCanAdd)),
            new DialogueOption("Add one log", completeDialogue(1)),
        ]

        if (logCount > 0) {
            options.push(takeLogOption)
        }

        return dialogueWithOptions(
            [prompt],
            DudeInteractIndicator.NONE,
            ...options,
            new DialogueOption(CANCEL_TEXT, completeDialogue(0))
        )
    },

    [BED_DIALOGUE]: () => {
        const bed: Bed = DialogueDisplay.instance.source as Bed
        const completeDialogue = new NextDialogue(BED_DIALOGUE, false)

        // Proxy for determining that this bed belongs to the player
        if (!here().allowPlacing) {
            return dialogue(
                ["This bed doesn't belong to you."],
                () => completeDialogue,
                DudeInteractIndicator.NONE
            )
        }

        let text: string
        let options = [
            new DialogueOption("Sleep (8 hours)", () => {
                bed.sleep(TimeUnit.HOUR * 8)
                return completeDialogue
            }),
            new DialogueOption("Nap (1 hour)", () => {
                bed.sleep(TimeUnit.HOUR)
                return completeDialogue
            }),
            new DialogueOption(CANCEL_TEXT, () => completeDialogue),
        ]

        if (bed.canSleepFor(8)) {
            text = "The comfy bed beckons to you. Do you give in?"
        } else if (bed.canSleepFor(1)) {
            text =
                "Your campfire will not burn long enough for a full rest, but you have time for a nap."
            options.splice(0, 1)
        } else {
            return dialogue(
                ["You cannot sleep if your campfire is out."],
                () => completeDialogue,
                DudeInteractIndicator.NONE
            )
        }

        return dialogueWithOptions([text], DudeInteractIndicator.NONE, ...options)
    },
}
