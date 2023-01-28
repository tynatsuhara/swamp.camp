import { getCookingRecipes } from "../../items/CraftingRecipe"
import { Item } from "../../items/Items"
import { session } from "../../online/session"
import { saveManager } from "../../SaveManager"
import { CraftingMenu } from "../../ui/CraftingMenu"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Campfire } from "../../world/elements/Campfire"
import { RestPoint } from "../../world/elements/RestPoint"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { player } from "../player"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const CAMPFIRE_DIALOGUE = "campfire"
export const CAMPFIRE_ADD_LOGS = "campfire-add-logs"

export const CAMPFIRE_DIALOGUES: DialogueSet = {
    [CAMPFIRE_DIALOGUE]: (cf: Campfire) => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full

        const logCount = cf.logs

        const completeDialogue = (logsTransferred: number) => {
            return () => {
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
                    return completeDialogue(-1)()
                })
            )
            options.push(
                new DialogueOption("Cook food", () => {
                    CraftingMenu.instance.open(getCookingRecipes(), "cook")
                    return completeDialogue(0)()
                })
            )
        }

        // TODO: Instead of hiding the button, consider adding an explanation as
        //       to why they can't rest right now (this could be annoying tho)
        const restPoint = cf.entity.getComponent(RestPoint)
        const restDurationHours = 2
        const now = WorldTime.instance.time
        if (
            session.isHost() && // MPTODO
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
            new DialogueOption(DialogueConstants.CANCEL_TEXT, completeDialogue(0))
        )
    },

    [CAMPFIRE_ADD_LOGS]: (cf: Campfire) => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full
        const logCount = cf.logs
        const playerLogCount = player().inventory.getItemCount(Item.WOOD)
        const logsYouCanAdd = Math.min(Campfire.LOG_CAPACITY - logCount, playerLogCount)
        const exitOption = new DialogueOption(
            DialogueConstants.CANCEL_TEXT,
            () => new NextDialogue(CAMPFIRE_DIALOGUE, false)
        )
        const hoursLeft = (logCount - 1) * Campfire.LOG_DURATION_HOURS

        const completeDialogue = (logsTransferred: number) => {
            return () => {
                cf.addLogs(logsTransferred)
                // cf.addLogs(logsTransferred)
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
}
