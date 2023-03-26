import { Item } from "../../items/Item"
import { DialogueDisplay } from "../../ui/DialogueDisplay"
import { InteractIndicator } from "../../ui/InteractIndicator"
import { DonatingOptions, InventoryDisplay } from "../../ui/InventoryDisplay"
import { PlacedLantern } from "../../world/elements/PlacedLantern"
import { TimeUnit } from "../../world/TimeUnit"
import { player } from "../player/index"
import { ShieldType } from "../weapons/ShieldType"
import { DialogueOption, DialogueSet, dialogueWithOptions, NextDialogue } from "./Dialogue"
import { DialogueConstants } from "./DialogueConstants"

export const LANTERN_DIALOGUE = "lantern"

export const LANTERN_DIALOGUES: DialogueSet = {
    [LANTERN_DIALOGUE]: (lantern: PlacedLantern) => {
        const isOn = lantern.on
        const initialFuelAmount = lantern.getFuelAmount()
        const canAddFuel = () =>
            lantern.canAddFuel() && player().inventory.getItemCount(Item.LAMP_OIL) > 0

        const showUpdatedInfo = () => {
            if (lantern.getFuelAmount() !== initialFuelAmount) {
                // RAF to prevent bad input (eg the close inv input closing the dialogue)
                requestAnimationFrame(() => DialogueDisplay.instance.startDialogue(lantern))
            }
        }

        const donatingOptions: DonatingOptions = {
            canDonate: (stack) => stack.item === Item.LAMP_OIL && canAddFuel(),
            onDonate: () => {
                lantern.addFuel() // client sync fn
                if (!lantern.canAddFuel() || player().inventory.getItemCount(Item.LAMP_OIL) === 0) {
                    InventoryDisplay.instance.close()
                    showUpdatedInfo()
                }
            },
            verb: "add fuel",
        }

        const addFuelOption = canAddFuel()
            ? new DialogueOption("Add fuel", () => {
                  InventoryDisplay.instance.open({
                      donating: donatingOptions,
                      onClose: showUpdatedInfo,
                  })
                  return new NextDialogue(LANTERN_DIALOGUE, false)
              })
            : undefined

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

        const text = (() => {
            if (initialFuelAmount === 0) {
                return "The lantern's fuel chamber is empty."
            }
            const fuelHours = Math.ceil(initialFuelAmount / TimeUnit.HOUR)
            if (fuelHours === 1) {
                return "The lantern will run out of fuel within the hour."
            } else if (fuelHours === PlacedLantern.FUEL_MAX_HOURS) {
                return "The lantern's fuel chamber is full."
            }
            return `The lantern will burn for about ${fuelHours} more hours.`
        })()

        return dialogueWithOptions(
            [text],
            InteractIndicator.NONE,
            addFuelOption,
            toggleOption,
            pickUpOption,
            exitOption
        )
    },
}
