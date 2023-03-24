import { Item } from "../../items/Items"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { PlacedLantern } from "../../world/elements/PlacedLantern"
import { player } from "../player/index"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"

export const LANTERN_DIALOGUE = "lantern"

export const LANTERN_DIALOGUES: DialogueSet = {
    [LANTERN_DIALOGUE]: (lantern: PlacedLantern) => {
        const isOn = lantern.isOn()

        const toggleOption = new DialogueOption(`Turn ${isOn ? "off" : "on"}`, () => {
            lantern.toggleOnOff()
            return new NextDialogue(LANTERN_DIALOGUE, false)
        })

        const pickUpOption = new DialogueOption("Pick up", () => {
            const added = player().inventory.addItem(Item.LANTERN, 1, lantern.getInvItemMetadata())
            if (added) {
                lantern.entity.selfDestruct()
            }
            return new NextDialogue(LANTERN_DIALOGUE, false)
        })

        return dialogueWithOptions([], InteractIndicator.NONE, toggleOption, pickUpOption)
    },
}
