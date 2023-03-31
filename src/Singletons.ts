import { ConcreteType } from "brigsby/dist"

type Singleton = {
    onSingletonDelete?: () => void
}

const singletonMap = new Map<ConcreteType<Singleton>, Singleton>()

/**
 * A global cache for managing stateful singletons.
 *
 * You can easily add a static reference in a class like so:
 *
 *    static get instance() {
 *        return Singletons.getOrCreate(MySingletonClass)
 *    }
 *
 */
export const Singletons = {
    get: <T>(type: ConcreteType<T> & Singleton): T | undefined => {
        return singletonMap.get(type) as T
    },

    getOrCreate: <T>(
        type: ConcreteType<T> & Singleton,
        supplier: () => T = () => new type()
    ): T => {
        const s = singletonMap.get(type)
        if (!!s) {
            return s as T
        }

        const supplied = supplier()
        singletonMap.set(type, supplied)
        return supplied
    },

    delete: <T>(type: ConcreteType<T>) => {
        const entry = singletonMap.get(type)
        entry?.onSingletonDelete?.()
        singletonMap.delete(type)
    },

    clear: () => {
        const keys = [...singletonMap.keys()]
        keys.forEach(Singletons.delete)
    },
}
