import { saveManager } from "../SaveManager"
import { session } from "./session"

const getInitAction = () => session.getRoom().makeAction("init")

export const hostOnJoin = (peerId: string) => {
    const [sender] = getInitAction()

    sender(saveManager.save(false), [peerId])
}

export const guestListenForInit = () => {
    const [_, receiver] = getInitAction()
    receiver((data, peerId) => {
        console.log(`received data from ${peerId}:`)
        console.log(data)
    })
}
