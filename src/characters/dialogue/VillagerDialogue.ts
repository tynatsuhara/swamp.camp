import { Lists } from "brigsby/dist/util/Lists"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { VillagerJob } from "../ai/VillagerJob"
import { Dude } from "../Dude"
import { Villager } from "../types/Villager"
import {
    dialogue,
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
} from "./Dialogue"

export const VILLAGER_DIALOGUE_ENTRYPOINT = "villager-start"
const VILLAGER_JOB_ACK = "villager-job-ack"

export const VILLAGER_DIALOGUE: DialogueSet = {
    [VILLAGER_DIALOGUE_ENTRYPOINT]: (villagerDude: Dude) => {
        const villager = villagerDude.entity.getComponent(Villager)

        const setJob = (job: VillagerJob | undefined) => {
            villager.job = job
            return new NextDialogue(VILLAGER_JOB_ACK, true)
        }

        return dialogueWithOptions(
            [
                Lists.oneOf([
                    "What do you need?",
                    "Hey boss.",
                    "What can I do?",
                    "Hello, Champion!",
                    "At your service, Champion.",
                ]),
            ],
            villager.job ? InteractIndicator.NONE : InteractIndicator.QUESTION,
            new DialogueOption("Head down to the mines.", () => {
                return setJob(VillagerJob.MINE)
            }),
            new DialogueOption("Work on collecting lumber.", () => {
                return setJob(VillagerJob.HARVEST_WOOD)
            }),
            new DialogueOption("Keep watch over the town.", () => {
                return setJob(VillagerJob.DEFEND)
            }),
            new DialogueOption("Help with construction.", () => {
                return setJob(VillagerJob.CONSTRUCTION)
            }),
            // TODO night shift?
            option(getExitText(), VILLAGER_DIALOGUE_ENTRYPOINT, false)
        )
    },

    [VILLAGER_JOB_ACK]: () => {
        return dialogue(
            [
                Lists.oneOf([
                    "Will do!",
                    "I'm on it.",
                    "I'll get to it.",
                    "Alrighty!",
                    "Can do.",
                    "Works for me!",
                ]),
            ],
            () => new NextDialogue(VILLAGER_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
