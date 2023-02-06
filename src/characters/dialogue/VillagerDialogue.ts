import { Lists } from "brigsby/dist/util/Lists"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Dude } from "../Dude"
import { NPC } from "../NPC"
import {
    DialogueOption,
    DialogueSet,
    dialogueWithOptions,
    getExitText,
    NextDialogue,
    option,
} from "./Dialogue"

export const VILLAGER_DIALOGUE_ENTRYPOINT = "villager-start"

export enum VillagerJob {
    NONE = "none",
    MINE = "mine",
    HARVEST_WOOD = "chop",
    DEFEND = "defend",
    CONSTRUCTION = "build",
}

export const VILLAGER_DIALOGUE: DialogueSet = {
    [VILLAGER_DIALOGUE_ENTRYPOINT]: (villager: Dude) => {
        const setJob = (job: VillagerJob | undefined) => {
            villager.blob["job"] = job
            villager.entity.getComponent(NPC).decideWhatToDoNext()
            return new NextDialogue(VILLAGER_DIALOGUE_ENTRYPOINT, false)
        }

        const currentJob = villager.blob["job"]

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
            currentJob ? DudeInteractIndicator.NONE : DudeInteractIndicator.QUESTION,
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
            new DialogueOption("Take some time off.", () => {
                return setJob(VillagerJob.NONE)
            }),
            // TODO night shift?
            option(getExitText(), VILLAGER_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
