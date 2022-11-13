import { Dude } from "../characters/Dude"
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

// Session establishment handshake
// 1. When a peer joins, the host identifies themselves (and the peer validates that they're the real host)
const [sendIntialHostPing, receiveInitialHostPing] = session.action<void>("hostping")
// 2. The peer identifies and authenticates themselves with their persistent multiplayer ID & secret
const [sendCredentials, receiveCredentials] = session.action<{ id: string; secret: string }>("mpid")
// 3. The host sends the world information to the peer
const [sendInitWorld, receiveInitWorld] = session.action<Save>("initworld")
// 4. The peer lets the host know their world (and network actions) have been initialized
const [sendInitWorldAck, receiveInitWorldAck] = session.action<void>("init:ack")

// Called when a new user has joined the game
export const hostOnJoin = () => {
    sendIntialHostPing(null)

    receiveCredentials(({ id, secret }, peerId) => {
        console.log(`received multiplayer ID ${id} from peer ${peerId}`)
        const salt = player().uuid
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
                onlinePlayers[dudeUUID] = { uuid: dudeUUID, password }
            }
            saveManager.setState({ onlinePlayers })
            peerToMultiplayerId[peerId] = id
            DudeFactory.instance.newOnlinePlayer(dudeUUID)
            sendInitWorld(saveManager.save("multiplayer"), peerId)
        })
    })

    receiveInitWorldAck((_, peerId) => {
        console.log(`received world ack from peer ${peerId}`)
        session.initializedPeers.push(peerId)
        NotificationDisplay.instance.push({ icon: "personmultiple", text: "someone joined" })
    })

    session.getRoom().onPeerLeave((peerId) => {
        cleanUpPeer(peerId)
        NotificationDisplay.instance.push({ icon: "personmultiple", text: "someone left" })
    })
}

export const hostSessionClose = () => {
    session.getPeers().forEach((p) => cleanUpPeer(p))
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
            session.hostId = peerId

            sendCredentials({ id: MULTIPLAYER_ID, secret: MULTIPLAYER_SECRET }, session.hostId)
        })
    })

    receiveInitWorld((data, peerId) => {
        if (peerId !== session.hostId) {
            console.warn(`received world init signal from imposter host ${peerId}`)
        }
        console.log(`received save data from ${peerId}:`)
        console.log(data)
        saveManager.loadSave(data as Save)
        sendInitWorldAck(null, session.hostId)
    })

    session.getRoom().onPeerLeave((peerId) => {
        if (peerId === session.hostId) {
            console.log("host left — returning to main menu")
            session.hostId = undefined
            SwampCampGame.instance.loadMainMenu()
        }
    })
}

export const cleanUpSession = () => {
    session.close()
    session.hostId = undefined
    session.initializedPeers = []
    peerToMultiplayerId = {}
}

const cleanUpPeer = (peerId: string) => {
    // MPTODO: Make this a syncFn when we support more than 2 players
    const multiplayerDude = Dude.get(ONLINE_PLAYER_DUDE_ID_PREFIX + peerToMultiplayerId[peerId])

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
    session.initializedPeers = session.initializedPeers.filter((p) => p !== peerId)
}
