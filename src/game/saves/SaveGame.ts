import { LocationManagerSaveState } from "./LocationManagerSaveState"

// Linear progression through the game
export const enum StoryState {
    INTRODUCTION = 0,
    ARRIVING_IN_FOREST = 1,
    KILLED_ORCS = 2,
}

export class Save {
    // storyState: StoryState
    locations: LocationManagerSaveState
    time: number
}