import { player } from "../characters/player/index"
import { session } from "./session"

export const ONLINE_PLAYER_DUDE_ID_PREFIX = "mp:"

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
            send(args, session.initializedPeers)
            return fn(...args)
        }
    }

    receive((args, peerId) => {
        if (session.isGuest()) {
            if (peerId === session.hostId) {
                fn(...args)
            } else {
                console.warn("other clients should not be calling syncFn")
            }
        }
    })

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
                    send({ [property]: value }, session.initializedPeers)
                }

                return success
            }
        },
    })

    receive((newData, peerId) => {
        if (session.isGuest()) {
            if (peerId === session.hostId) {
                Object.keys(newData).forEach((key) => {
                    data[key] = newData[key]
                })
                onChange(data)
            } else {
                console.warn("other clients should not be calling syncFn")
            }
        }
    })

    return proxy
}

/**
 * Similar to syncFn, but can be invoked on either clients or the host.
 * If the client invocation is accepted by the host, it will be forwarded to other clients.
 *
 * @param mode
 *   - all: the fn will be called on all hosts (as long as the fn doesn't return "reject" on host)
 *   - host-only: the fn will only execute on the host
 *
 * The syncFn receives an auth object:
 *   - auth.trusted will be true if:
 *     1) The function is invoked locally OR
 *     2) The function is invoked by the host
 *   - auth.dudeUUID is the uuid of the peer's dude, OR undefined for guests
 *
 * If the syncFn returns nothing, it will be propagated from the host to other clients.
 * If the syncFn returns the string "reject", it will cancel the propagation.
 */
export const clientSyncFn = <T extends any[]>(
    id: string,
    mode: "all" | "host-only" | "caller-and-host",
    fn: (auth: { trusted: boolean; dudeUUID: string | undefined }, ...args: T) => "reject" | void
): ((...args: T) => void) => {
    const [send, receive] = session.action<T>(id)

    // the fn that actually gets called on the originator's machine
    const wrappedFn = (...args: T) => {
        const hostAuth = {
            trusted: true,
            dudeUUID: player()?.uuid,
        }

        // offline clientSyncFn is just a normal fn
        if (!session.isOnline()) {
            return fn(hostAuth, ...args)
        }

        if (session.isGuest()) {
            // if you're a guest, you can only talk directly to the host
            send(args, session.hostId)

            // don't execute on guest
            if (mode === "host-only") {
                return
            }
        } else if (mode === "all") {
            // host talks to everyone
            send(args, session.initializedPeers)
        }

        // call fn on the sender's machine
        return fn(hostAuth, ...args)
    }

    receive((args, peerId) => {
        if (session.isGuest()) {
            // guests should only listen for the host, and should only listen to the host in "all" mode
            if (peerId !== session.hostId || mode !== "all") {
                return
            }
        }

        const auth = {
            trusted: !session.isHost(), // only the host should be untrusting
            // MPTODO peerToMultiplayerId only gets populated on the host right now
            dudeUUID: session.isHost()
                ? ONLINE_PLAYER_DUDE_ID_PREFIX + session.peerToMultiplayerId[peerId]
                : undefined,
        }

        // call the fn on the receiver's machine
        const result = fn(auth, ...args)

        // propagate
        if (mode === "all" && session.isHost()) {
            const otherPeers = Object.keys(session.getPeers()).filter((p) => p !== peerId)
            if (result !== "reject" && otherPeers.length > 0) {
                send(args, otherPeers)
            }
        }
    })

    return wrappedFn
}

/**
 * @returns the base64 result of sha-256
 */
export const base64hash = async (data: string, maxLen?: number) => {
    const hashBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
    const u8 = new Uint8Array(hashBytes)
    let byteString = ""
    for (const byte of u8) {
        byteString += String.fromCharCode(byte)
    }
    // convert bytestring to base64 (or really, base36)
    return btoa(byteString).substring(0, maxLen)
}
