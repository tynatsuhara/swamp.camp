import { saveManager } from "../SaveManager"
import { Singletons } from "../Singletons"

// TODO can we clean this all up?
class TownStat {
    readonly id: string

    constructor(id: string) {
        this.id = id
    }

    adjust(adjustment: number) {
        const existingStats = saveManager.getState().townStats || {}
        const currentValue = existingStats[this.id] || 0
        saveManager.setState({
            townStats: {
                ...existingStats,
                [this.id]: currentValue + adjustment,
            },
        })
        console.log(`new stat value for ${this.id}: ${saveManager.getState().townStats[this.id]}`)
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
    readonly happiness = new TownStat("happiness")
    readonly theocracy = new TownStat("theocracy")
}
