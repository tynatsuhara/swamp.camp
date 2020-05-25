// Utility functions for iterable

export const Lists = {
    minBy<T>(list: T[], fn: (element: T) => number): T {
        if (list.length == 0) {
            return null
        }
        
        let smallestAmount = Number.MAX_SAFE_INTEGER
        let smallest: T
        for (const i of list) {
            const amount = fn(i)
            if (amount < smallestAmount) {
                smallestAmount = amount
                smallest = i
            }
        }

        return smallest
    },

    maxBy<T>(list: T[], fn: (element: T) => number): T {
        if (list.length == 0) {
            return null
        }
        
        let smallestAmount = Number.MAX_SAFE_INTEGER
        let smallest: T
        for (const i of list) {
            const amount = fn(i)
            if (amount < smallestAmount) {
                smallestAmount = amount
                smallest = i
            }
        }

        return smallest
    },

    oneOf<T>(list: T[]): T {
        return list[Math.floor(Math.random() * list.length)]
    },
}