import { ActionProgress, ActionReceiver, ActionSender, joinRoom, Room } from "trystero"

let room: Room
let host = true
let cachedActions: Record<string, any> = {}
const cachedLazyActions: Record<string, any> = {}
const lazyActionInitFns: (() => void)[] = []
const initLazyActions = () => lazyActionInitFns.forEach((fn) => fn())

// MPTODO don't hardcode these
const APP_ID = "https://swamp-camp-default-rtdb.firebaseio.com/"
const ROOM_ID = "30908535-9bba-4e21-8a68-3384b7cd604f"

/**
 * Wrapper around generic P2P rooms, adding host and guest semantics to match the game network model.
 */
export const session = {
    open: (onPeerJoin: (peerId: string) => void) => {
        host = true
        room = joinRoom({ appId: APP_ID }, ROOM_ID)
        initLazyActions()
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
