import { ActionReceiver, ActionSender, Room } from "trystero"
import { DudeFactory, ONLINE_PLAYER_DUDE_ID_PREFIX } from "../characters/DudeFactory"
import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { newUUID } from "../saves/uuid"
import { SwampCampGame } from "../SwampCampGame"
import { here } from "../world/locations/LocationManager"
import { session } from "./session"

/**
 * Utilities for syncing game state and logic
 */

let hostId: string
let initializedPeers: string[] = []
const peerToMultiplayerId: Record<string, string> = {}

// Store a stable multiplayer ID for the user.
const MULTIPLAYER_ID_KEY = "multiplayer_id"
if (!localStorage.getItem(MULTIPLAYER_ID_KEY)) {
    localStorage.setItem(MULTIPLAYER_ID_KEY, newUUID())
}
export const MULTIPLAYER_ID = localStorage.getItem(MULTIPLAYER_ID_KEY)

// Core actions
const actionMultiplayerId = () => session.getRoom().makeAction<{ id: string }>("mpid")
const actionInitWorld = () => session.getRoom().makeAction<Save>("init")
const actionInitWorldAck = () => session.getRoom().makeAction<void>("init:ack")

// Called when a new user has joined the game
export const hostOnJoin = (peerId: string) => {
    // MPTODO: Refactor this so that these actions don't get re-initialized if a third player joins
    const [_, receiveMultiplayerId] = actionMultiplayerId()
    const [sendInitWorld] = actionInitWorld()
    const [_2, receiveInitWorldAck] = actionInitWorldAck()

    receiveMultiplayerId(({ id }, peerId) => {
        peerToMultiplayerId[peerId] = id
        DudeFactory.instance.newOnlinePlayer(id)
        sendInitWorld(saveManager.save(false), peerId)
    })

    receiveInitWorldAck((_, peerId) => {
        initializedPeers.push(peerId)
    })

    session.getRoom().onPeerLeave((peerId) => {
        cleanUpPeer(peerId)
    })
}

export const hostSessionClose = () => {
    session.close()
    initializedPeers.forEach((p) => cleanUpPeer(p))
    initializedPeers = []
}

// MPTODO it seems like something here is breaking if the host closes then reopens the lobby
export const guestOnJoin = () => {
    const [sendMultiplayerId] = actionMultiplayerId()
    const [_, receiveInitWorld] = actionInitWorld()
    const [sendInitWorldAck] = actionInitWorldAck()

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

/**
 * A function which can be called on the host, which will be invoked client-side.
 * Args should be serializable!
 * If the client calls this function, it will be a no-op that generates a warning log.
 */
export const syncFn = <T extends any[], R = void>(
    id: string,
    fn: (...args: T) => R
): ((...args: T) => R) => {
    let sendAndReceiveRoom: Room
    let sendFn: ActionSender<T>
    let receiveFn: ActionReceiver<T>
    const lazyInit = () => {
        const [lazySender, lazyReceiver] = session.getRoom().makeAction<T>(id)
        sendFn = lazySender
        receiveFn = lazyReceiver
        sendAndReceiveRoom = session.getRoom()
    }

    const wrappedFn = (...args: T) => {
        // clear out sender/receiver if they were initialized in a previous session
        // (or the session has ended and the room is now undefined)
        if (session.getRoom() !== sendAndReceiveRoom) {
            sendFn = undefined
            receiveFn = undefined
            sendAndReceiveRoom = undefined
        }

        // offline syncFn is just a normal fn
        if (!session.isOnline()) {
            return fn(...args)
        }

        if (!sendFn) {
            lazyInit()
        }

        if (session.isGuest()) {
            console.warn("client cannot call syncFn")
        } else {
            sendFn(args, initializedPeers)
            return fn(...args)
        }
    }

    if (session.isGuest()) {
        lazyInit()

        receiveFn((args) => {
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
    let sendAndReceiveRoom: Room
    let sendFn: ActionSender<Partial<T>>
    let receiveFn: ActionReceiver<Partial<T>>
    const lazyInit = () => {
        const [lazySender, lazyReceiver] = session.getRoom().makeAction<Partial<T>>(id)
        sendFn = lazySender
        receiveFn = lazyReceiver
        sendAndReceiveRoom = session.getRoom()
    }

    const proxy = new Proxy(data, {
        set(target, property, value, receiver) {
            // clear out sender/receiver if they were initialized in a previous session
            // (or the session has ended and the room is now undefined)
            if (session.getRoom() !== sendAndReceiveRoom) {
                sendFn = undefined
                receiveFn = undefined
                sendAndReceiveRoom = undefined
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
                    sendFn({ [property]: value }, initializedPeers)
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
}

const cleanUpPeer = (peerId: string) => {
    // TODO: Change the cleanup logic so that their state is still persisted for future joins
    const multiplayerDude = here()
        .getDudes()
        .find((d) => d.uuid === ONLINE_PLAYER_DUDE_ID_PREFIX + peerToMultiplayerId[peerId])
    here().removeDude(multiplayerDude)
    initializedPeers = initializedPeers.filter((p) => p !== peerId)
}
