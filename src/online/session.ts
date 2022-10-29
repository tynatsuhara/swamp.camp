import { ActionReceiver, ActionSender, joinRoom, Room } from "trystero"

let room: Room
let host = true

// TODO don't hardcode these
const APP_ID = "92fe373a-2446-426a-8b8d-28b51bb30b01"
const ROOM_ID = "30908535-9bba-4e21-8a68-3384b7cd604f"

export const session = {
    open: (onPeerJoin: (peerId: string) => void) => {
        host = true
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        room.onPeerJoin((peerId) => {
            console.log(`${peerId} joined!`)
            // TODO: push world state to them
            onPeerJoin(peerId)
        })
        console.log("opening lobby")
    },

    close: () => {
        room?.leave()
        room = null
        host = true
    },

    join: (): Promise<string> => {
        host = false
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        console.log("joining lobby")

        return new Promise((resolve) => {
            // Right now, let's assume we only allow 2 peers
            room.onPeerJoin((peerId) => {
                resolve(peerId)
            })
        })
    },

    isOnline: () => !!room,

    /**
     * @returns true if they are not a guest! This DOES NOT mean that the player is necessarily online!
     */
    isHost: () => host,

    /**
     * @returns true if the user is online in someone else's world
     */
    isGuest: () => session.isOnline() && !host,

    getRoom: () => room,

    getPeers: () => room?.getPeers(),

    syncAction: <T extends object>(namespace: string) => {
        const [send, receive] = room.makeAction<T>(namespace)
        return { send, receive }
    },

    /**
     * The provided data is the initial data on both host and client.
     * The client received data from the host when the object is updated.
     * If the client writes data, it will be a no-op that generates a warning log.
     */
    syncData: <T extends object>(id: string, data: T, onChange = (updated: T) => {}) => {
        let sendAndReceiveRoom: Room
        let sendFn: ActionSender<Partial<T>>
        let receiveFn: ActionReceiver<Partial<T>>
        const lazyInit = () => {
            const [lazySender, lazyReceiver] = room.makeAction<Partial<T>>(id)
            sendFn = lazySender
            receiveFn = lazyReceiver
            sendAndReceiveRoom = room
        }

        const proxy = new Proxy(data, {
            set(target, property, value, receiver) {
                // clear out sender/receiver if they were initialized in a previous session
                if (room !== sendAndReceiveRoom) {
                    sendFn = null
                    receiveFn = null
                    sendAndReceiveRoom = null
                }

                // offline syncData is just a normal object
                if (!session.isOnline()) {
                    return Reflect.set(target, property, value, receiver)
                }

                // lazy initialize
                if (!sendFn) {
                    lazyInit()
                }

                if (session.isGuest()) {
                    console.warn("client cannot update data")
                    return true // no-op
                } else {
                    // Update the data locally, then sync it
                    let success = Reflect.set(target, property, value, receiver)
                    if (success) {
                        // @ts-ignore
                        sendFn({ [property]: value })
                    }

                    return success
                }
            },
        })

        if (session.isGuest()) {
            lazyInit()

            receiveFn((newData) => {
                Object.keys(newData).forEach((key) => {
                    data[key] = newData[key]
                })
                onChange(data)
            })
        }

        return proxy
    },

    /**
     * A function which can be called on the host, which will be invoked client-side.
     * If the client calls this function, it will be a no-op that generates a warning log.
     */
    syncFn: (id: string, fn: () => void) => {
        let sendAndReceiveRoom: Room
        let sendFn: ActionSender<any>
        let receiveFn: ActionReceiver<any>
        const lazyInit = () => {
            const [lazySender, lazyReceiver] = room.makeAction(id)
            sendFn = lazySender
            receiveFn = lazyReceiver
            sendAndReceiveRoom = room
        }

        const wrappedFn = () => {
            // clear out sender/receiver if they were initialized in a previous session
            if (room !== sendAndReceiveRoom) {
                sendFn = null
                receiveFn = null
                sendAndReceiveRoom = null
            }

            // offline syncFn is just a normal fn
            if (!session.isOnline()) {
                fn()
                return
            }

            if (!sendFn) {
                lazyInit()
            }

            if (session.isGuest()) {
                console.warn("client cannot call syncFn")
            } else {
                fn()
                sendFn(null)
            }
        }

        if (session.isGuest()) {
            lazyInit()

            receiveFn(() => {
                fn()
            })
        }

        return wrappedFn
    },
}
