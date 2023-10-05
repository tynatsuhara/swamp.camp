import { HUD } from "../../ui/HUD"
import { IconDisplay } from "../../ui/IconSprite"
import { LocationManager, camp, here } from "../locations/LocationManager"

// TODO: BUG: This doesn't work on cold start, since the indicators are only initialized once Start() runs for the Dude
export const interactableDoorIconSupplier = (
    teleporterId: string,
    fallback?: IconDisplay
): (() => IconDisplay | undefined) => {
    return () => {
        const destinationUUID =
            LocationManager.instance.getTeleporterDestination(teleporterId).location
        const destination = LocationManager.instance.get(destinationUUID)
        const markedLocations = HUD.instance.getMarkedLocations().filter((l) => l !== here())

        // rather than doing a graph traversal, right now we assume that every
        // location is one off of camp()
        const showIndicatorToUseDoor =
            markedLocations.indexOf(destination) >= 0 ||
            (destination === camp() && markedLocations.length > 0)

        // TODO: Should this itself also add a (secondary) OffscreenIndicator? How would that work?

        if (showIndicatorToUseDoor) {
            return { icon: "!" }
        }

        return fallback
    }
}
