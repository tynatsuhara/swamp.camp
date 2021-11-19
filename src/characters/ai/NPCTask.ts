import { NPCTaskContext } from "./NPCTaskContext"

/**
 * A task being performed by an NPC. This can be a normal scheduled activity or
 * something ad-hoc like attacking a nearby enemy. May be simulated in the background.
 */
export abstract class NPCTask {
    abstract performTask(context: NPCTaskContext): void
}
