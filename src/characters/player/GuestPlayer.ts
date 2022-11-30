import { UpdateData } from "brigsby/dist"
import { ActionSender } from "trystero"
import { controls } from "../../Controls"
import { session } from "../../online/session"
import { AbstractPlayer, PlayerControls } from "./AbstractPlayer"
import { registerPlayerInstance } from "./index"

// isAttackDown gets inferred based on the previously used controls
type SerializedPlayerControls = Omit<PlayerControls, "isAttackDown">

const KEY_PRESS_CONTROLS: (keyof SerializedPlayerControls)[] = [
    "isJumpDown",
    "isRollDown",
    "isSheathKeyDown",
]

export class GuestPlayer extends AbstractPlayer {
    constructor() {
        super()
        if (session.isGuest()) {
            registerPlayerInstance(this)
        }
    }

    // on host
    private controls: PlayerControls

    // on client
    private sendControls: ActionSender<SerializedPlayerControls>

    awake() {
        super.awake()
        const [sendControls, receiveControls] = session.action<SerializedPlayerControls>(
            this.dude.syncId("ctrl")
        )

        this.sendControls = sendControls

        receiveControls((receivedControls) => {
            if (!this.controls) {
                this.controls = { ...receivedControls, isAttackDown: false }
                return
            }

            const newControls: Partial<SerializedPlayerControls> = {}

            // ||= these to make sure they are true for 1 frame on the host
            KEY_PRESS_CONTROLS.forEach((control) => {
                // @ts-ignore
                newControls[control] = this.controls[control] || receivedControls[control]
            })

            this.controls = {
                ...receivedControls,
                ...newControls,
                isAttackDown: !this.controls.isAttackDown && receivedControls.isAttackHeld,
            }
        })
    }

    update(updateData: UpdateData): void {
        if (session.isGuest()) {
            // send input to host
            this.sendControls(this.serializeControls())
            const possibleInteractable = this.updateInteractables(updateData, true)
            if (controls.isInteractDown() && possibleInteractable) {
                possibleInteractable.interact(this.dude)
            }
            this.checkHotKeys(updateData)
        } else if (session.isHost() && this.controls) {
            // this.controls might get updated while this is executing, spread/copy to avoid weird behavior
            const controls = { ...this.controls }

            // receive data, update dude
            this.doMovementOnHost(updateData.elapsedTimeMillis, this.controls)

            const possibleInteractable = this.updateInteractables(updateData, false)
            if (controls.isInteractDown && possibleInteractable) {
                possibleInteractable.interact(this.dude)
            }

            KEY_PRESS_CONTROLS.forEach((control) => {
                if (controls[control]) {
                    // @ts-ignore
                    this.controls[control] = false
                }
            })
        }
    }
}
