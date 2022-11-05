import { Item } from "../../items/Items"
import { saveManager } from "../../SaveManager"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Bed } from "../../world/elements/Bed"
import { Campfire } from "../../world/elements/Campfire"
import { RestPoint } from "../../world/elements/RestPoint"
import { here } from "../../world/locations/LocationManager"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { player } from "../player"
import { ShieldType } from "../weapons/ShieldType"
import {
    dialogue,
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    NextDialogue,
} from "./Dialogue"

export const CAMPFIRE_DIALOGUE = "campfire"
export const CAMPFIRE_ADD_LOGS = "campfire-add-logs"
export const BED_DIALOGUE = "bed"

const CANCEL_TEXT = "Leave"

export const ITEM_DIALOGUES: DialogueSet = {
    [CAMPFIRE_DIALOGUE]: () => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full

        const cf: Campfire = DialogueDisplay.instance.source as Campfire
        const logCount = cf.logs

        const completeDialogue = (logsTransferred: number) => {
            return () => {
                if (logsTransferred > 0) {
                    player().inventory.removeItem(Item.WOOD, logsTransferred)
                }
                cf.addLogs(logsTransferred)
                return new NextDialogue(CAMPFIRE_DIALOGUE, false)
            }
        }

        const options = [
            new DialogueOption(
                !logCount ? `Start a fire` : `Stoke the fire`,
                () => new NextDialogue(CAMPFIRE_ADD_LOGS, true)
            ),
        ]

        if (logCount > 0) {
            options.push(
                new DialogueOption("Take a torch", () => {
                    player().setShield(ShieldType.TORCH)
                    return completeDialogue(-1)()
                })
            )
        }

        // TODO: Instead of hiding the button, consider adding an explanation as
        //       to why they can't rest right now (this could be annoying tho)
        const restPoint = cf.entity.getComponent(RestPoint)
        const restDurationHours = 2
        const now = WorldTime.instance.time
        if (
            restPoint.canRestFor(restDurationHours, cf) &&
            saveManager.getState().lastCampfireRestTime < now - 12 * TimeUnit.HOUR
        ) {
            options.push(
                new DialogueOption("Rest briefly", () => {
                    saveManager.setState({ lastCampfireRestTime: now })
                    restPoint.rest(restDurationHours)
                    player().heal(player().maxHealth / 2)
                    return completeDialogue(0)()
                })
            )
        }

        return dialogueWithOptions(
            [],
            DudeInteractIndicator.NONE,
            ...options,
            new DialogueOption(CANCEL_TEXT, completeDialogue(0))
        )
    },

    [CAMPFIRE_ADD_LOGS]: () => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full

        const cf: Campfire = DialogueDisplay.instance.source as Campfire
        const logCount = cf.logs
        const playerLogCount = player().inventory.getItemCount(Item.WOOD)
        const logsYouCanAdd = Math.min(Campfire.LOG_CAPACITY - logCount, playerLogCount)
        const exitOption = new DialogueOption(
            CANCEL_TEXT,
            () => new NextDialogue(CAMPFIRE_DIALOGUE, false)
        )
        const hoursLeft = (logCount - 1) * Campfire.LOG_DURATION_HOURS

        const completeDialogue = (logsTransferred: number) => {
            return () => {
                if (logsTransferred > 0) {
                    player().inventory.removeItem(Item.WOOD, logsTransferred)
                }
                cf.addLogs(logsTransferred)
                return new NextDialogue(CAMPFIRE_DIALOGUE, false)
            }
        }

        if (logsYouCanAdd === 0) {
            return dialogueWithOptions(
                [
                    playerLogCount === 0
                        ? "You don't have any more logs to add to the fire."
                        : "Adding any more logs to the fire would be dangerous.",
                ],
                DudeInteractIndicator.NONE,
                exitOption
            )
        } else if (logsYouCanAdd === 1) {
            return dialogueWithOptions(
                [
                    playerLogCount === 1
                        ? "You only have one log to add to the fire."
                        : "The fire is almost too big.",
                ],
                DudeInteractIndicator.NONE,
                new DialogueOption("Add one log", completeDialogue(1)),
                exitOption
            )
        }

        let prompt: string
        if (logCount === 1) {
            prompt = `The fire will go out soon.`
        } else if (logCount === 0) {
            prompt = `Add logs to ignite the fire?`
        } else {
            prompt = `The fire will burn for at least ${hoursLeft} more hours.`
        }

        const options = [
            new DialogueOption(`Add ${logsYouCanAdd} logs`, completeDialogue(logsYouCanAdd)),
            new DialogueOption("Add one log", completeDialogue(1)),
        ]

        return dialogueWithOptions([prompt], DudeInteractIndicator.NONE, ...options, exitOption)
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
                bed.rest(8)
                player().heal(player().maxHealth)
                return completeDialogue
            }),
            new DialogueOption("Nap (1 hour)", () => {
                bed.rest(1)
                player().heal(player().maxHealth / 2)
                return completeDialogue
            }),
            new DialogueOption(CANCEL_TEXT, () => completeDialogue),
        ]

        if (bed.canRestFor(8)) {
            text = "The comfy bed beckons to you. Do you give in?"
        } else if (bed.canRestFor(1)) {
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
