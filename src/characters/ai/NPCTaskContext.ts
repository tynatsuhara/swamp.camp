import { Point } from "brigsby/dist"
import { Location } from "../../world/locations/Location"
import { Dude } from "../Dude"

/**
 * Contains context on the current state of the NPC/world, as well as callbacks
 * that a task can call. All task decisions should be made based on this context.
 *
 * The goal of this interface is to enable NPCTask implementations to describe an
 * NPC behavior at a high level, which can then be applied in real-time (the active
 * location) or in a background simulation.
 */
export interface NPCTaskContext {
    /**
     * Should only be used for read-only operations
     */
    dude: Dude

    /**
     * Tells the NPC to go to a position
     */
    walkTo: (p: Point) => void

    /**
     * Roam around aimlessly
     */
    roam: (
        speedMultiplier: number,
        options?: {
            ptSelectionFilter?: (pt: Point) => boolean
            goalOptionsSupplier?: () => Point[]
            pauseEveryMillis?: number
            pauseForMillis?: number
        }
    ) => void

    /**
     * Go to a different location
     */
    goToLocation: (wl: Location) => void

    doNothing: () => void
}
