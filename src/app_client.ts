import { joinRoom } from "trystero"

const room = joinRoom(
    { appId: "92fe373a-2446-426a-8b8d-28b51bb30b01" },
    "30908535-9bba-4e21-8a68-3384b7cd604f"
)

room.onPeerJoin((peerId) => console.log(`${peerId} joined`))
