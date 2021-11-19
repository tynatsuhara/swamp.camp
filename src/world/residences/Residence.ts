import { Component } from "brigsby/dist/Component"
import { DudeType } from "../../characters/DudeFactory"

export abstract class Residence extends Component {
    abstract readonly locationUUID: string

    abstract hasCapacity: (type: DudeType) => boolean

    abstract isHomeOf: (uuid: string) => boolean

    abstract setResidentPending: () => void

    abstract canClaimPendingSlot: (type: DudeType) => boolean

    abstract claimPendingSlot: (uuid: string) => void

    abstract evictResident: (uuid: string) => void
}
