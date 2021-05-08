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
        
        let biggestAmount = Number.MIN_SAFE_INTEGER
        let biggest: T
        for (const i of list) {
            const amount = fn(i)
            if (amount > biggestAmount) {
                biggestAmount = amount
                biggest = i
            }
        }

        return biggest
    },

    oneOf<T>(list: T[]): T {
        return list[Math.floor(Math.random() * list.length)]
    },

    shuffled<T>(list: T[]): T[] {
        const copy = [...list]
        Lists.shuffle(copy)
        return copy
    },

    shuffle<T>(list: T[]) {
        var currentIndex = list.length, temporaryValue, randomIndex;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            // And swap it with the current element.
            temporaryValue = list[currentIndex];
            list[currentIndex] = list[randomIndex];
            list[randomIndex] = temporaryValue;
        }
    },

    /**
     * @param start inclusive
     * @param end exclusive
     */
    range(start: number, end: number): number[] {
        return Array.from({length: (end - start)}, (v, k) => k + start);
    },

    repeat<T>(times: number, list: T[]): T[] {
        const result = []
        Lists.range(0, times).forEach(() => result.push(...list))
        return result
    },
}