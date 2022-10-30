import { UpdateData } from "brigsby/dist"
import { session } from "../../online/session"
import { AbstractPlayer } from "./AbstractPlayer"

// TODO
export class GuestPlayer extends AbstractPlayer {
    update(updateData: UpdateData): void {
        if (session.isGuest()) {
            // send input to host
        } else if (session.isHost()) {
            // receive data, update dude
        }
    }
}
