import { DudeFactory, ONLINE_PLAYER_DUDE_ID_PREFIX } from "../characters/DudeFactory"
import { player } from "../characters/player/index"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { newUUID } from "../saves/uuid"
import { SwampCampGame } from "../SwampCampGame"
import { NotificationDisplay } from "../ui/NotificationDisplay"
import { here } from "../world/locations/LocationManager"
import { computeSessionIdFromPeerId, session } from "./session"
import { base64hash } from "./utils"

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

// Multiplayer secret which will only ever be sent to the host.
const MULTIPLAYER_SECRET_KEY = "multiplayer_secret"
if (!localStorage.getItem(MULTIPLAYER_SECRET_KEY)) {
    localStorage.setItem(MULTIPLAYER_SECRET_KEY, newUUID())
}
export const MULTIPLAYER_SECRET = localStorage.getItem(MULTIPLAYER_SECRET_KEY)

// Core actions
const [sendIntialHostPing, receiveInitialHostPing] = session.action<void>("hostping")
const [sendCredentials, receiveCredentials] = session.action<{ id: string; secret: string }>("mpid")
const [sendInitWorld, receiveInitWorld] = session.action<Save>("initworld")
const [sendInitWorldAck, receiveInitWorldAck] = session.action<void>("init:ack")

// Called when a new user has joined the game
export const hostOnJoin = () => {
    sendIntialHostPing(null)

    receiveCredentials(({ id, secret }, peerId) => {
        console.log(`received multiplayer ID ${id} from peer ${peerId}`)
        const salt = player().dude.uuid
        base64hash(secret + salt).then((password) => {
            const dudeUUID = ONLINE_PLAYER_DUDE_ID_PREFIX + id
            const onlinePlayers = saveManager.getState().onlinePlayers
            const existingPlayerData = onlinePlayers[dudeUUID]
            if (existingPlayerData) {
                console.log(existingPlayerData)
                if (password !== onlinePlayers[dudeUUID].password) {
                    console.warn(`invalid credentials for player ${id}`)
                    return
                }
            } else {
                onlinePlayers[dudeUUID] = { password }
            }
            saveManager.setState({ onlinePlayers })
            peerToMultiplayerId[peerId] = id
            DudeFactory.instance.newOnlinePlayer(dudeUUID)
            sendInitWorld(saveManager.save("multiplayer"), peerId)
        })
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
    receiveInitialHostPing((_, peerId) => {
        computeSessionIdFromPeerId(peerId).then((expectedSessionId) => {
            if (session.getId() !== expectedSessionId) {
                console.warn(
                    `received world init signal from imposter host ${peerId} (expected session ID ${expectedSessionId})`
                )
                return
            }
            hostId = peerId

            sendCredentials({ id: MULTIPLAYER_ID, secret: MULTIPLAYER_SECRET }, hostId)
        })
    })

    receiveInitWorld((data, peerId) => {
        if (peerId !== hostId) {
            console.warn(`received world init signal from imposter host ${peerId}`)
        }
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
    // MPTODO: Make this a syncFn when we support more than 2 players
    const multiplayerDude = here()
        .getDudes()
        .find((d) => d.uuid === ONLINE_PLAYER_DUDE_ID_PREFIX + peerToMultiplayerId[peerId])

    const { uuid, password } = saveManager.getState().onlinePlayers[multiplayerDude.uuid]

    // serialize the dude so their stuff is persisted in future sessions
    saveManager.setState({
        onlinePlayers: {
            ...saveManager.getState().onlinePlayers,
            [uuid]: {
                ...multiplayerDude.save(),
                password,
            },
        },
    })

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
            console.warn(`client cannot call syncFn ${id}`)
        } else {
            send(args, initializedPeers)
            return fn(...args)
        }
    }

    if (session.isGuest()) {
        receive((args, peerId) => {
            if (peerId === hostId) {
                fn(...args)
            } else {
                console.warn("other clients should not be calling syncFn")
            }
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
                console.warn(`client cannot update data ${id}`)
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
        receive((newData, peerId) => {
            if (peerId === hostId) {
                Object.keys(newData).forEach((key) => {
                    data[key] = newData[key]
                })
                onChange(data)
            } else {
                console.warn("other clients should not be calling syncFn")
            }
        })
    }

    return proxy
}

/**
 * Similar to syncFn, but can be invoked on either clients or the host.
 * If the client invocation is accepted by the host, it will be forwarded to other clients.
 *
 * The syncFn receives a "trusted" argument which will be true if:
 *   1) The function is invoked locally OR
 *   2) The function is invoked by the host
 *
 * If the syncFn returns nothing, it will be propagated from the host to other clients.
 * If the syncFn returns the string "reject", it will cancel the propagation.
 */
export const clientSyncFn = <T extends any[]>(
    id: string,
    fn: (trusted: boolean, ...args: T) => "reject" | void
): ((...args: T) => void) => {
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
        const result = fn(peerId === hostId, ...args)
        const otherPeers = session.getPeers().filter((p) => p !== peerId)
        if (result !== "reject" && otherPeers.length > 0) {
            send(args, otherPeers)
        }
    })

    return wrappedFn
}
