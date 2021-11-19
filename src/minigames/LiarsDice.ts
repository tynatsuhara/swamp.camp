const FACES = [0, 1, 2, 3, 4, 5]
const SIDES = 6
const STARTING_DICE = 5

type DiceBid = {
    readonly face: number
    readonly count: number
}

const factorial = (num: number) => {
    var result = num
    if (num === 0 || num === 1) return 1
    while (num > 1) {
        num--
        result *= num
    }
    return result
}

const choose = (n, k) => {
    return factorial(n) / (factorial(k) * factorial(n - k))
}

// const probabilityExactly = (faceCount: number, totalDice: number) => {
//     faceCount = Math.max(faceCount, 0)
//     return choose(totalDice, faceCount) * Math.pow(1/6, faceCount) * Math.pow(5/6, totalDice - faceCount)
// }

const probabilityAtLeast = (faceCount: number, totalDice: number) => {
    faceCount = Math.max(faceCount, 0)
    if (faceCount === 0) return 1
    const n = totalDice
    const q = faceCount
    let result = 0
    for (let x = q; x <= n; x++) {
        result += choose(n, x) * Math.pow(1 / 6, x) * Math.pow(5 / 6, n - x)
    }
    return result
}

const probabilityWithHand = (hand: number[], bid: DiceBid, totalDice: number) => {
    return probabilityAtLeast(bid.count - hand[bid.face], totalDice - hand[bid.face])
}

const rollDice = (diceInHand: number): number[] => {
    const rolls = [0, 0, 0, 0, 0, 0]
    for (let i = 0; i < diceInHand; i++) {
        const r = Math.floor(Math.random() * SIDES)
        rolls[r]++
    }
    return rolls
}

class DicePlayer {
    readonly name: string
    diceCount: number = STARTING_DICE
    hand: number[] // a hand is represented by the counts for each side EG [0, 0, 2, 1, 0, 2] = 2 3s, 1 4, 2 6s

    constructor(name: string) {
        this.name = name
        this.roll()
    }

    roll() {
        this.hand = rollDice(this.diceCount)
    }

    aiFirstBid(): DiceBid {
        const possibleBids: number[] = []
        for (let i = 0; i < SIDES; i++) {
            for (let j = 0; j < this.hand[i]; j++) {
                possibleBids.push(i)
            }
        }
        return {
            face: possibleBids[Math.floor(Math.random() * possibleBids.length)],
            count: 1,
        }
    }

    /**
     * @return a new bid or null to call "liar"
     */
    aiPlayRound(bid: DiceBid, totalDice: number): DiceBid {
        /**
         * options:
         *   increase bid: face, number, or both
         *   call liar
         *
         * steps:
         *   1. are they a liar or not? (considering your own dice + probability)
         *   2. they're not lying.
         */

        const probabilityOfPreviousBid = probabilityAtLeast(bid.count, totalDice)

        // we KNOW it's true, increase face safely by 1
        if (this.hand[bid.face] > bid.count) {
            return {
                face: bid.face,
                count: bid.count + 1,
            }
        }

        console.log(`probabilityOfPreviousBid=${probabilityOfPreviousBid}`)
        if (probabilityOfPreviousBid < 0.2) {
            return null
        }

        const possibleBids: DiceBid[] = []

        // increase count by 1
        possibleBids.push({
            face: bid.face,
            count: bid.count + 1,
        })

        // increase face
        for (let f = bid.face + 1; f < SIDES; f++) {
            possibleBids.push({
                face: f,
                count: bid.count,
            })
        }

        // increase bid
        for (let f = 0; f < SIDES; f++) {
            possibleBids.push({
                face: f,
                count: bid.count + 1,
            })
        }

        // TODO add randomness and random bluffing

        possibleBids.sort(
            (a, b) =>
                probabilityWithHand(this.hand, b, totalDice) -
                probabilityWithHand(this.hand, a, totalDice)
        )

        return possibleBids[0]
    }
}

const doGame = () => {
    const allPlayers: DicePlayer[] = [
        new DicePlayer("Tyler"),
        new DicePlayer("Miya"),
        new DicePlayer("Lane"),
        new DicePlayer("Gumball"),
    ]

    console.log(allPlayers)
    const s = (bid: DiceBid) => `${bid.count}x${bid.face + 1}`

    let playersInGame = [...allPlayers]
    let previousPlayer = playersInGame.shift()
    playersInGame.push(previousPlayer)

    while (true) {
        let bid = previousPlayer.aiFirstBid()
        console.log(`${previousPlayer}: starting bid ${s(bid)}`)

        while (!!bid) {
            const p = playersInGame.shift()
            playersInGame.push(p)
            const totalDice = playersInGame.map((p) => p.diceCount).reduce((a, b) => a + b)
            const nextBid = p.aiPlayRound(bid, totalDice)
            if (!nextBid) {
                console.log(`${p.name}: ${previousPlayer.name} is a liar!`)
                const wasLie =
                    playersInGame.map((p) => p.hand[bid.face]).reduce((a, b) => a + b) < bid.count
                // TODO make the loser start the next round
                if (wasLie) {
                    previousPlayer.diceCount--
                    console.log(`it was a lie: ${previousPlayer.name} loses a die`)
                } else {
                    p.diceCount--
                    console.log(`it wasn't a lie: ${p.name} loses a die`)
                }
            } else {
                console.log(`${p.name} bids ${s(nextBid)}`)
            }
            previousPlayer = p
            bid = nextBid
            playersInGame.forEach((p) => {
                if (p.diceCount == 0) {
                    console.log(`${p.name} eliminated`)
                }
            })
            playersInGame = playersInGame.filter((p) => p.diceCount > 0)
        }

        if (playersInGame.length == 1) {
            // game over
            break
        }

        playersInGame.forEach((p) => p.roll())
    }

    console.log(`${playersInGame[0].name} wins!`)
}

window["dice"] = doGame
