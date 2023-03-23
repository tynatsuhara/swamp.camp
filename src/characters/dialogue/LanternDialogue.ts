import { Item } from "../../items/Items"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { PlacedLantern } from "../../world/elements/PlacedLantern"
import { player } from "../player/index"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"

export const LANTERN_DIALOGUE = "lantern"

export const LANTERN_DIALOGUES: DialogueSet = {
    [LANTERN_DIALOGUE]: (lantern: PlacedLantern) => {
        return dialogueWithOptions(
            [],
            InteractIndicator.NONE,
            new DialogueOption("Pick up", () => {
                const added = player().inventory.addItem(Item.LANTERN)
                if (added) {
                    lantern.entity.selfDestruct()
                }
                return new NextDialogue(LANTERN_DIALOGUE, false)
            })
        )
    },
}
