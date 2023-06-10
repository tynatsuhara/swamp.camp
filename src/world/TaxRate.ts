import { DudeFaction } from "../characters/DudeFactory"
import { DudeType } from "../characters/DudeType"
import { saveManager } from "../core/SaveManager"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { LocationManager } from "./locations/LocationManager"

export enum TaxRate {
    NONE,
    LOW,
    MODERATE,
    HIGH,
    VERY_HIGH,
}

export const collectTaxes = () => {
    const taxPayers = LocationManager.instance
        .getLocations()
        .flatMap((l) => l.getDudes())
        .filter(
            (dude) => dude.type !== DudeType.PLAYER && dude.factions.includes(DudeFaction.VILLAGERS)
        ).length

    const { taxRate, coins } = saveManager.getState()
    const collected = taxPayers * taxRate

    if (collected > 0) {
        NotificationDisplay.instance.push({
            text: `Collected taxes: ${collected} gold`,
            icon: "coin",
        })
        saveManager.setState({
            coins: coins + collected,
        })
    }
}
