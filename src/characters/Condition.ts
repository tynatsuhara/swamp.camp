export enum Condition {
    ON_FIRE,
    POISONED,
}

export type ActiveCondition = {
    condition: Condition
    /**
     * The world time when the effect will expire
     */
    expiration: number
    /**
     * For conditions which need to apply an effect
     * repeatedly, this tracks the last tick
     */
    lastExec?: number
}
