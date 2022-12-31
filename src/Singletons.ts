import { ConcreteType } from "brigsby/dist"

const singletonMap = new Map<any, any>()

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
    get: <T>(type: ConcreteType<T>): T | undefined => {
        return singletonMap.get(type)
    },

    getOrCreate: <T>(type: ConcreteType<T>, supplier: () => T = () => new type()): T => {
        const s = singletonMap.get(type)
        if (!!s) {
            return s
        }

        const supplied = supplier()
        singletonMap.set(type, supplied)
        return supplied
    },

    delete: <T>(type: ConcreteType<T>) => singletonMap.delete(type),

    clear: () => singletonMap.clear(),
}
