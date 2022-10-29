import { saveManager } from "../SaveManager"
import { Save } from "../saves/SaveGame"
import { session } from "./session"

const getInitAction = () => session.syncAction<Save>("init")

export const hostOnJoin = (peerId: string) => {
    const { send } = getInitAction()

    send(saveManager.save(false), [peerId])
}

export const guestListenForInit = () => {
    const { receive } = getInitAction()
    receive((data, peerId) => {
        console.log(`received save data from ${peerId}:`)
        console.log(data)
        saveManager.loadSave(data as Save)
    })
}
