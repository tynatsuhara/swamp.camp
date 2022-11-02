import { DudeFactory, ONLINE_PLAYER_DUDE_ID_PREFIX } from "../characters/DudeFactory"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { newUUID } from "../saves/uuid"
import { SwampCampGame } from "../SwampCampGame"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { here } from "../world/locations/LocationManager"
import { session } from "./session"

/**
 * Utilities for syncing game state and logic
 */

let hostId: string
let initializedPeers: string[] = []
let peerToMultiplayerId: Record<string, string> = {}

// Store a stable multiplayer ID for the user.
const MULTIPLAYER_ID_KEY = "multiplayer_id"
if (!localStorage.getItem(MULTIPLAYER_ID_KEY)) {
    localStorage.setItem(MULTIPLAYER_ID_KEY, newUUID())
}
export const MULTIPLAYER_ID = localStorage.getItem(MULTIPLAYER_ID_KEY)

// Core actions
const [sendMultiplayerId, receiveMultiplayerId] = session.action<{ id: string }>("mpid")
const [sendInitWorld, receiveInitWorld] = session.action<Save>("init")
const [sendInitWorldAck, receiveInitWorldAck] = session.action<void>("init:ack")

// Called when a new user has joined the game
export const hostOnJoin = () => {
    receiveMultiplayerId(({ id }, peerId) => {
        console.log(`received multiplayer ID ${id} from peer ${peerId}`)
        peerToMultiplayerId[peerId] = id
        DudeFactory.instance.newOnlinePlayer(id)
        sendInitWorld(saveManager.save(false), peerId)
    })

    receiveInitWorldAck((_, peerId) => {
        console.log(`received world ack from peer ${peerId}`)
        initializedPeers.push(peerId)
        NotificationDisplay.instance.push({ icon: "personmultiple", text: "someone joined" })
    })

    session.getRoom().onPeerLeave((peerId) => {
        cleanUpPeer(peerId)
        NotificationDisplay.instance.push({ icon: "personmultiple", text: "someone left" })
    })
}

export const hostSessionClose = () => {
    initializedPeers.forEach((p) => cleanUpPeer(p))
    cleanUpSession()
}

export const guestOnJoin = () => {
    sendMultiplayerId({ id: MULTIPLAYER_ID })

    receiveInitWorld((data, peerId) => {
        hostId = peerId
        console.log(`received save data from ${peerId}:`)
        console.log(data)
        saveManager.loadSave(data as Save)
        sendInitWorldAck(null, hostId)
    })

    session.getRoom().onPeerLeave((peerId) => {
        if (peerId === hostId) {
            console.log("host left — returning to main menu")
            hostId = undefined
            SwampCampGame.instance.loadMainMenu()
        }
    })
}

export const cleanUpSession = () => {
    session.close()
    hostId = undefined
    initializedPeers = []
    peerToMultiplayerId = {}
}

const cleanUpPeer = (peerId: string) => {
    // MPTODO: Change the cleanup logic so that their state is still persisted for future joins
    // MPTODO: Make this a syncFn when we support more than 2 players
    const multiplayerDude = here()
        .getDudes()
        .find((d) => d.uuid === ONLINE_PLAYER_DUDE_ID_PREFIX + peerToMultiplayerId[peerId])
    here().removeDude(multiplayerDude)
    initializedPeers = initializedPeers.filter((p) => p !== peerId)
}

/**
 * A function which can be called on the host, which will be invoked client-side.
 * Args should be serializable!
 * If the client calls this function, it will be a no-op that generates a warning log.
 */
export const syncFn = <T extends any[], R = void>(
    id: string,
    fn: (...args: T) => R
): ((...args: T) => R) => {
    const [send, receive] = session.action<T>(id)

    const wrappedFn = (...args: T) => {
        // offline syncFn is just a normal fn
        if (!session.isOnline()) {
            return fn(...args)
        }

        if (session.isGuest()) {
            console.warn("client cannot call syncFn")
        } else {
            send(args, initializedPeers)
            return fn(...args)
        }
    }

    if (session.isGuest()) {
        receive((args) => {
            fn(...args)
        })
    }

    return wrappedFn
}

/**
 * The provided data is the initial data on both host and client.
 * The client received data from the host when the object is updated.
 * If the client writes data, it will be a no-op that generates a warning log.
 */
export const syncData = <T extends object>(id: string, data: T, onChange = (updated: T) => {}) => {
    const [send, receive] = session.action<T>(id)

    const proxy = new Proxy(data, {
        set(target, property, value, receiver) {
            // offline syncData is just a normal object
            if (!session.isOnline()) {
                return Reflect.set(target, property, value, receiver)
            }

            if (session.isGuest()) {
                console.warn("client cannot update data")
                return true // no-op
            } else {
                // Update the data locally, then sync it
                let success = Reflect.set(target, property, value, receiver)
                if (success) {
                    // @ts-ignore
                    send({ [property]: value }, initializedPeers)
                }

                return success
            }
        },
    })

    if (session.isGuest()) {
        receive((newData) => {
            Object.keys(newData).forEach((key) => {
                data[key] = newData[key]
            })
            onChange(data)
        })
    }

    return proxy
}

/**
 * MPTODO
 * Similar to syncFn, but can be invoked on either clients or the host.
 * If the client invocation is accepted by the host, it will be forwarded to other clients.
 * MPTODO: How should we propagate the trusted nature?
 *
 * The syncFn receives a "trusted" argument which will be true if:
 *   1) The function is invoked locally OR
 *   2) The function is invoked by the host
 */
export const clientSyncFn = <T extends any[], R = void>(
    id: string,
    fn: (trusted: boolean, ...args: T) => R
): ((...args: T) => R) => {
    const [send, receive] = session.action<T>(id)

    const wrappedFn = (...args: T) => {
        // offline clientSyncFn is just a normal fn
        if (!session.isOnline()) {
            return fn(true, ...args)
        }

        if (session.isGuest()) {
            // if you're a guest, you can only talk directly to the host
            send(args, hostId)
        } else {
            // host talks to everyone
            send(args, initializedPeers)
        }

        return fn(true, ...args)
    }

    receive((args, peerId) => {
        fn(peerId === hostId, ...args)
        // MPTODO: forward to other peers. we need to decide if it's trusted first
        // if (session.isHost()) {
        //     sendFn(args, initializedPeers.filter(p => p !== peerId))
        // }
    })

    return wrappedFn
}
