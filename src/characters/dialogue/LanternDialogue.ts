import { Item } from "../../items/Item"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { InventoryDisplay } from "../../ui/InventoryDisplay"
import { PlacedLantern } from "../../world/elements/PlacedLantern"
import { player } from "../player/index"
import { ShieldType } from "../weapons/ShieldType"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const LANTERN_DIALOGUE = "lantern"

export const LANTERN_DIALOGUES: DialogueSet = {
    [LANTERN_DIALOGUE]: (lantern: PlacedLantern) => {
        const isOn = lantern.on
        const initialFuelAmount = lantern.getFuelAmount()

        const showUpdatedInfo = () => {
            if (lantern.getFuelAmount() !== initialFuelAmount) {
                // RAF to prevent bad input (eg the close inv input closing the dialogue)
                requestAnimationFrame(() => DialogueDisplay.instance.startDialogue(lantern))
            }
        }

        const addFuelOption = new DialogueOption(`Add fuel`, () => {
            InventoryDisplay.instance.open({
                donating: {
                    canDonate: (stack) => stack.item === Item.LAMP_OIL && lantern.canAddFuel(),
                    onDonate: () => {
                        lantern.addFuel()
                        if (
                            !lantern.canAddFuel() ||
                            player().inventory.getItemCount(Item.LAMP_OIL) === 0
                        ) {
                            InventoryDisplay.instance.close()
                            showUpdatedInfo()
                        }
                    },
                    verb: "add fuel",
                },
                onClose: showUpdatedInfo,
            })
            return new NextDialogue(LANTERN_DIALOGUE, false)
        })

        const toggleOption = initialFuelAmount
            ? new DialogueOption(`Turn ${isOn ? "off" : "on"}`, () => {
                  lantern.toggleOnOff()
                  return new NextDialogue(LANTERN_DIALOGUE, false)
              })
            : undefined

        const pickUpOption = new DialogueOption("Pick up", () => {
            const added = player().inventory.addItem(Item.LANTERN, 1, lantern.getInvItemMetadata())
            if (added) {
                lantern.entity.selfDestruct()
                const lanternIndex = player().inventory.findIndex((s) => s?.item === Item.LANTERN)
                player().setShield(ShieldType.LANTERN, lanternIndex)
            }
            return new NextDialogue(LANTERN_DIALOGUE, false)
        })

        const exitOption = new DialogueOption(
            DialogueConstants.CANCEL_TEXT,
            () => new NextDialogue(LANTERN_DIALOGUE, false)
        )

        return dialogueWithOptions(
            [`Fuel: ${lantern.getFuelAmount()}`], // TODO
            InteractIndicator.NONE,
            addFuelOption,
            toggleOption,
            pickUpOption,
            exitOption
        )
    },
}
