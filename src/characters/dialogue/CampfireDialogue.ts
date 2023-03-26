import { getCookingRecipes } from "../../items/CraftingRecipe"
import { Item } from "../../items/Item"
import { session } from "../../online/session"
import { saveManager } from "../../SaveManager"
import { CraftingMenu } from "../../ui/CraftingMenu"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { InventoryDisplay } from "../../ui/InventoryDisplay"
import { Campfire } from "../../world/elements/Campfire"
import { RestPoint } from "../../world/elements/RestPoint"
import { TimeUnit } from "../../world/TimeUnit"
import { WorldTime } from "../../world/WorldTime"
import { player } from "../player"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const CAMPFIRE_DIALOGUE = "campfire"
const CAMPFIRE_ADD_LOGS = "campfire-add-logs"

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
            InteractIndicator.NONE,
            ...options,
            new DialogueOption(DialogueConstants.CANCEL_TEXT, completeDialogue(0))
        )
    },

    [CAMPFIRE_ADD_LOGS]: (cf: Campfire) => {
        // the fire can be dead, almost dead, partially full, almost entirely full, or totally full
        const getPlayerLogCount = () => player().inventory.getItemCount(Item.WOOD)
        const getLogsYouCanAdd = () =>
            Math.min(Campfire.LOG_CAPACITY - cf.logs, getPlayerLogCount())
        const exitOption = new DialogueOption(
            DialogueConstants.CANCEL_TEXT,
            () => new NextDialogue(CAMPFIRE_DIALOGUE, false)
        )
        const initialLogCount = cf.logs

        if (getLogsYouCanAdd() === 0) {
            return dialogueWithOptions(
                [
                    getPlayerLogCount() === 0
                        ? "You don't have any more logs to add to the fire."
                        : "Adding any more logs to the fire would be dangerous.",
                ],
                InteractIndicator.NONE,
                exitOption
            )
        }

        let prompt: string
        if (cf.logs === 1) {
            prompt = `The fire will go out soon.`
        } else if (cf.logs === 0) {
            prompt = `Add logs to ignite the fire?`
        } else {
            prompt = `The fire will burn for at least ${
                (cf.logs - 1) * Campfire.LOG_DURATION_HOURS
            } more hours.`
        }

        const showUpdatedInfo = () => {
            // pass the logs fields of the campfire but make it go straight to this dialogue stage
            if (cf.logs !== initialLogCount) {
                // RAF to prevent bad input (eg the close inv input closing the dialogue)
                requestAnimationFrame(() => {
                    DialogueDisplay.instance.startDialogue({
                        ...cf,
                        dialogue: CAMPFIRE_ADD_LOGS,
                    })
                })
            }
        }

        const addLogsOption = new DialogueOption(`Add logs`, () => {
            InventoryDisplay.instance.open({
                donating: {
                    canDonate: (stack) =>
                        stack.item === Item.WOOD && cf.logs < Campfire.LOG_CAPACITY,
                    onDonate: () => {
                        cf.addLogs(1) // client sync fn
                        if (getLogsYouCanAdd() === 0) {
                            InventoryDisplay.instance.close()
                            showUpdatedInfo()
                        }
                    },
                    verb: "add to fire",
                },
                onClose: showUpdatedInfo,
            })
            return new NextDialogue(CAMPFIRE_DIALOGUE, false)
        })

        return dialogueWithOptions([prompt], InteractIndicator.NONE, addLogsOption, exitOption)
    },
}
