import { Component, UpdateData } from "brigsby/dist"
import { session } from "../online/session"

// TODO
export class GuestPlayer extends Component {
    constructor() {
        super()
    }

    update(updateData: UpdateData): void {
        if (session.isGuest()) {
            // send input to host
        } else if (session.isHost()) {
            // receive data, update dude
        }
    }
}
