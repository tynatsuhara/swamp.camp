import { ActionProgress, ActionReceiver, ActionSender, joinRoom, Room, selfId } from "trystero"
import { base64hash } from "./utils"

let sessionId: string
let room: Room
let host = true
let cachedActions: Record<string, any> = {}
const cachedLazyActions: Record<string, any> = {}
const lazyActionInitFns: (() => void)[] = []
const initLazyActions = () => lazyActionInitFns.forEach((fn) => fn())

export const SESSION_ID_LENGTH = 4

// Session ID is a hash prefix of the host peer ID, to prevent fake host attack
export const computeSessionIdFromPeerId = async (peerId: string) => {
    const hash = await base64hash(peerId, SESSION_ID_LENGTH)
    return hash.toUpperCase()
}

const APP_ID = "9fea88cf-69d4-4ab8-b9cb-44c88d9de16b"
/**
 * This isn't a real password — it is used for encrypting session descriptions in the matching
 * network in order to prevent unnecessary PII exposure to sources other than SWAMP CAMP.
 */
const PASSWORD = "30908535-9bba-4e21-8a68-3384b7cd604f"

/**
 * Wrapper around generic P2P rooms, adding host and guest semantics to match the game network model.
 */
export const session = {
    /**
     * @returns a promise that resolves once the session is established
     */
    open: async (onPeerJoin: (peerId: string) => void) => {
        host = true
        sessionId = await computeSessionIdFromPeerId(selfId)
        console.log("opening lobby")
        room = joinRoom({ appId: APP_ID, password: PASSWORD }, sessionId)
        initLazyActions()
        room.onPeerJoin((peerId) => {
            console.log(`${peerId} joined!`)
            onPeerJoin(peerId)
        })
    },

    close: () => {
        room?.leave()
        room = undefined
        host = true
        cachedActions = {}
    },

    join: (id: string): Promise<string> => {
        sessionId = id
        host = false
        room = joinRoom({ appId: APP_ID, password: PASSWORD }, sessionId)
        initLazyActions()
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

    getId: () => sessionId,

    getRoom: () => room,

    getPeers: () => room?.getPeers(),

    pingPeers: () => {
        room.getPeers().forEach((p) =>
            room.ping(p).then((pingVal) => {
                console.log(`${p}: ${pingVal} ms`)
            })
        )
    },

    /**
     * @returns A lazily-instantiated, memoized action. This will persist across leaving and rejoining sessions.
     */
    action: <T>(id: string): [ActionSender<T>, ActionReceiver<T>, ActionProgress] => {
        if (cachedLazyActions[id]) {
            return cachedLazyActions[id]
        }

        // written by lazyInit
        let lazySender: ActionSender<T>
        const sendWrapper: ActionSender<T> = (...args) => lazySender(...args)

        let lazyReceiverHandler: Parameters<ActionReceiver<T>>[0]
        const receiveWrapper: ActionReceiver<T> = (handler) => {
            lazyReceiverHandler = handler
            if (cachedActions[id]) {
                const [_, receive] = cachedActions[id]
                receive(handler)
            }
        }

        let lazyProgressHandler: Parameters<ActionProgress>[0]
        const progressWrapper: ActionProgress = (handler) => {
            lazyProgressHandler = handler
            if (cachedActions[id]) {
                const [_, _2, progress] = cachedActions[id]
                progress(handler)
            }
        }

        // lazy receiver and action progress accept listeners, so we need to reinitizalize those listeners when a room is joined.
        // We do that by storing this lazyInit function and executing it in onPeerJoin.
        const lazyInit = () => {
            const [sender, receiver, progress] =
                cachedActions[id] ?? session.getRoom().makeAction<T>(id)
            // lazily initialize sender
            lazySender = sender
            // re-initialize receiver handler
            if (lazyReceiverHandler) {
                receiver(lazyReceiverHandler)
            }
            // ret-initialize progress handler
            if (lazyProgressHandler) {
                progress(lazyProgressHandler)
            }

            cachedActions[id] = [sender, receiver, progress]
        }

        if (session.isOnline()) {
            lazyInit()
        }

        // store it for later sessions being established
        lazyActionInitFns.push(lazyInit)

        cachedLazyActions[id] = [sendWrapper, receiveWrapper, progressWrapper]

        return cachedLazyActions[id]
    },
}

// const actionReceiverHandlers: Record<string, any> = {}
// const actionProgressHandlers: Record<string, any> = {}

window["session"] = session
