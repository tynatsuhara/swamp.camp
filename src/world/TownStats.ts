import { saveManager } from "../SaveManager"
import { Singletons } from "../Singletons"
import { TaxRate } from "./TaxRate"

type OmitUnderscored<T> = { [K in keyof T as K extends `_${infer _}` ? never : K]: T[K] }

abstract class TownStat {
    readonly id: string

    constructor(id: string) {
        this.id = id
    }

    get value() {
        return this.getExistingStats()[this.id] ?? 0
    }

    _adjust(adjustment: number) {
        saveManager.setState({
            townStats: {
                ...this.getExistingStats(),
                [this.id]: this.value + adjustment,
            },
        })
        console.log(`new stat value for ${this.id}: ${saveManager.getState().townStats[this.id]}`)
    }

    private getExistingStats() {
        return saveManager.getState().townStats || {}
    }
}

class HappinessStat extends TownStat {
    constructor() {
        super("happiness")
    }

    // TODO balance these and hook up to triggers
    impactHomelessTonight = () => this._adjust(-1)
    impactNoLongerHomeless = () => this._adjust(1)
    impactHeadstonePlaced = () => this._adjust(1)
    impactVillagerKilled = () => this._adjust(-5)
    impactNotEnoughFoodToday = () => this._adjust(-2)
    impactBlackLungTreated = () => this._adjust(5)
    impactTaxCollected = (taxRate: TaxRate) =>
        this._adjust(
            {
                [TaxRate.NONE]: 2,
                [TaxRate.LOW]: 1,
                [TaxRate.MODERATE]: 0,
                [TaxRate.HIGH]: -1,
                [TaxRate.VERY_HIGH]: -2,
            }[taxRate]
        )
    impactMandatoryChuchAttendance = () => this._adjust(-3)

    // TODO positive impact based on town upgrades (inn, roads, bridges)

    shouldConsiderStriking = () => this.value <= -30
    shouldConsiderDeserting = () => this.value <= -40
    shouldGiveShopDiscounts = () => this.value >= 20
}

// TODO
class TheocracyStat extends TownStat {
    constructor() {
        super("theocracy")
    }

    // TODO balance these and hook up to triggers
    impactMandatoryAttendance = () => this._adjust(3)
    impactDonation = () => this._adjust(10)

    shouldGrantMinorBlessing = () => this.value >= 20
    shouldGrantMajorBlessing = () => this.value >= 50
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
    readonly happiness: OmitUnderscored<HappinessStat> = new HappinessStat()
    readonly theocracy: OmitUnderscored<TheocracyStat> = new TheocracyStat()

    getProfilerData = () => ({
        happiness: this.happiness.value,
        theocracy: this.theocracy.value,
    })
}
