import { Lists } from "brigsby/dist/util/Lists"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { DudeInteractIndicator } from "../../ui/DudeInteractIndicator"
import { Dude } from "../Dude"
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
    MINE = "mine",
    HARVEST_WOOD = "chop",
    DEFEND = "defend",
}

export const VILLAGER_DIALOGUE: DialogueSet = {
    [VILLAGER_DIALOGUE_ENTRYPOINT]: () => {
        // TODO add a different initial dialogue with a "!"

        const villager: Dude = DialogueDisplay.instance.source as Dude

        const setJob = (job: VillagerJob | undefined) => {
            villager.blob["job"] = job
            return new NextDialogue(VILLAGER_DIALOGUE_ENTRYPOINT, false)
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
            DudeInteractIndicator.NONE,
            new DialogueOption("Head down to the mines.", () => {
                return setJob(VillagerJob.MINE)
            }),
            new DialogueOption("Work on collecting lumber.", () => {
                return setJob(VillagerJob.HARVEST_WOOD)
            }),
            new DialogueOption("Keep watch over the town.", () => {
                return setJob(VillagerJob.DEFEND)
            }),
            // TODO construction?
            new DialogueOption("Take some time off.", () => {
                return setJob(undefined)
            }),
            // TODO night shift?
            option(getExitText(), VILLAGER_DIALOGUE_ENTRYPOINT, false)
        )
    },
}
