import { isHost, room, syncData } from "./online/OnlineUtils"

const exampleSyncData = syncData<{ health: number }>("p1-health", { health: 5 }, () => {
    console.log(exampleSyncData.health)
})

room.onPeerJoin((peerId) => {
    if (isHost) {
        console.log(`${peerId} joined`)
        exampleSyncData.health--
        console.log(exampleSyncData)
    }
})
