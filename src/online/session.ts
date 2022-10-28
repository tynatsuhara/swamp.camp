import { joinRoom, Room } from "trystero"

let room: Room
let host = true

// TODO don't hardcode these
const APP_ID = "92fe373a-2446-426a-8b8d-28b51bb30b01"
const ROOM_ID = "30908535-9bba-4e21-8a68-3384b7cd604f"
const INITIAL_DATA_KEY = "init"

export const session = {
    open: () => {
        host = true
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        room.onPeerJoin((peerId) => {
            console.log(`${peerId} joined!`)
            // TODO: push world state to them
            const [sender] = room.makeAction(INITIAL_DATA_KEY)
            sender("test-data", [peerId])
        })
        console.log("opening lobby")
    },

    close: () => {
        room?.leave()
        room = null
    },

    join: (): Promise<void> => {
        host = false
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        console.log("joining lobby")

        return new Promise((resolve) => {
            // Right now, let's assume we only allow 2 peers
            room.onPeerJoin((peerId) => {
                const [_, receiver] = room.makeAction(INITIAL_DATA_KEY)
                receiver((data, peerId) => {
                    console.log(data)
                })
            })
        })
    },

    isOnline: () => !!room,

    isHost: () => host,

    isGuest: () => !host,

    getRoom: () => room,

    syncData: <T extends object>(id: string, data: T, onChange = () => {}) => {
        const [sender, receiver] = room.makeAction<Partial<T>>(id)

        const proxy = new Proxy(data, {
            set(target, property, value, receiver) {
                // offline syncData is just a normal object
                if (!session.isOnline()) {
                    return Reflect.set(target, property, value, receiver)
                }

                if (!host) {
                    console.warn("client cannot update data")
                    return true
                }

                // Update the data locally, then sync it
                let success = Reflect.set(target, property, value, receiver)
                if (success) {
                    // @ts-ignore
                    sender({ [property]: value })
                }

                return success
            },
        })

        receiver((newData) => {
            Object.keys(newData).forEach((key) => {
                data[key] = newData[key]
            })
            onChange()
        })

        return proxy
    },
}
