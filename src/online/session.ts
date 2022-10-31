import { ActionProgress, ActionReceiver, ActionSender, joinRoom, Room } from "trystero"

let room: Room
let host = true
let cachedActions: Record<string, any> = {}

// TODO don't hardcode these
const APP_ID = "https://swamp-camp-default-rtdb.firebaseio.com/"
const ROOM_ID = "30908535-9bba-4e21-8a68-3384b7cd604f"

/**
 * Wrapper around generic P2P rooms, adding host and guest semantics to match the game network model.
 */
export const session = {
    open: (onPeerJoin: (peerId: string) => void) => {
        host = true
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        room.onPeerJoin((peerId) => {
            console.log(`${peerId} joined!`)
            onPeerJoin(peerId)
        })
        console.log("opening lobby")
    },

    close: () => {
        room?.leave()
        room = undefined
        host = true
        cachedActions = {}
    },

    join: (): Promise<string> => {
        host = false
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        console.log("looking for lobby")

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

    pingPeers: () => {
        room.getPeers().forEach((p) =>
            room.ping(p).then((pingVal) => {
                console.log(`${p}: ${pingVal} ms`)
            })
        )
    },

    cachedAction: <T>(id: string): [ActionSender<T>, ActionReceiver<T>, ActionProgress] => {
        if (!cachedActions[id]) {
            cachedActions[id] = session.getRoom().makeAction<T>(id)
        }
        return cachedActions[id]
    },
}

window["session"] = session
