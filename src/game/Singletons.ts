const singletons = new Map<any, any>()

/**
 * A static cache for managing stateful singletons.
 */
export const Singletons = {
    getOrCreate: <T>(type: SingletonType<T>, supplier: () => T = () => new type()): T => {
        const s = singletons.get(type)
        if (!!s) {
            return s
        }
    
        const supplied = supplier()
        singletons.set(type, supplied)
        return supplied
    },

    destroy: () => singletons.clear()
}

interface SingletonType<T> { new(...args: any[]): T }