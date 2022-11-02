import { UpdateData } from "brigsby/dist"
import { ActionSender } from "trystero"
import { session } from "../../online/session"
import { AbstractPlayer, SerializablePlayerControls } from "./AbstractPlayer"
import { registerPlayerInstance } from "./index"

// TODO
export class GuestPlayer extends AbstractPlayer {
    constructor() {
        super()
        if (session.isGuest()) {
            registerPlayerInstance(this)
        }
    }

    // on host
    // MPTODO: This will probably have some janky behavior because the "onKey" handlers might run multiple times in a row
    private controls: SerializablePlayerControls

    // on client
    private sendControls: ActionSender<SerializablePlayerControls>

    awake() {
        super.awake()
        const [sendControls, receiveControls] = session.action<SerializablePlayerControls>(
            `${this.dude.syncId}ctrl`
        )

        this.sendControls = sendControls

        receiveControls((data) => {
            this.controls = data
        })
    }

    update(updateData: UpdateData): void {
        if (session.isGuest()) {
            // send input to host
            this.sendControls(this.getSerializablePlayerControls())
        } else if (session.isHost()) {
            // receive data, update dude
            if (this.controls) {
                this.doMovementOnHost(updateData.elapsedTimeMillis, this.controls)
            }
        }
    }
}
