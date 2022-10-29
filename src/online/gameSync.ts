import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { SwampCampGame } from "../SwampCampGame"
import { session } from "./session"

let hostId: string

const getInitAction = () => session.syncAction<Save>("init")

export const hostOnJoin = (peerId: string) => {
    const { send } = getInitAction()

    send(saveManager.save(false), [peerId])
}

export const guestListenForInit = () => {
    const { receive } = getInitAction()
    receive((data, peerId) => {
        hostId = peerId
        console.log(`received save data from ${peerId}:`)
        console.log(data)
        saveManager.loadSave(data as Save)
    })

    session.getRoom().onPeerLeave((peerId) => {
        if (peerId === hostId) {
            console.log("host left — returning to main menu")
            hostId = undefined
            SwampCampGame.instance.loadMainMenu()
        }
    })
}
