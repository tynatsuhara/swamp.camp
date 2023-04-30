import { saveManager } from "../SaveManager"
import { Singletons } from "../Singletons"

abstract class TownStat {
    readonly id: string

    constructor(id: string) {
        this.id = id
    }

    adjust(adjustment: number) {
        saveManager.setState({
            townStats: {
                ...this.getExistingStats(),
                [this.id]: this.getCurrentValue() + adjustment,
            },
        })
        console.log(`new stat value for ${this.id}: ${saveManager.getState().townStats[this.id]}`)
    }

    getCurrentValue() {
        return this.getExistingStats()[this.id] ?? 0
    }

    private getExistingStats() {
        return saveManager.getState().townStats || {}
    }
}

// TODO
class HappinessStat extends TownStat {
    constructor() {
        super("happiness")
    }
}

// TODO
class TheocracyStat extends TownStat {
    constructor() {
        super("theocracy")
    }
}

export class TownStats {
    static get instance() {
        return Singletons.getOrCreate(TownStats)
    }

    /**
     * TODO: Determine additional stats. Ideas:
     *   - relationships with other nations such as centaurs and gnolls
     *   - safety/strength of your military for sending them out (protecting villagers in the forest)
     *   - black magic (converse to theocracy)
     */
    readonly happiness = new HappinessStat()
    readonly theocracy = new TheocracyStat()
}
