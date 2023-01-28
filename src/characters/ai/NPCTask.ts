import { NPCTaskContext } from "./NPCTaskContext"

/**
 * A task being performed by an NPC. This can be a normal scheduled activity or
 * something ad-hoc like attacking a nearby enemy. May be simulated in the background.
 * It is okay for a task to store data (the task will be recreated every few seconds).
 * NPCTask::performTask will be called on EVERY NPC::update, so it shouldn't be very expensive.
 */
export abstract class NPCTask {
    abstract performTask(context: NPCTaskContext): void
}
