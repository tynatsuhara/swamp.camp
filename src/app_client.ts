import { session } from "./online/session"

session.join().then(() => {
    console.log(`joined session! player IDs = ${session.getRoom().getPeers()}`)
})
