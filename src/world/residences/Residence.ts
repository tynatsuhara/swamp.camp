import { Component } from "brigsby/lib"
import { DudeType } from "../../characters/DudeType"

export abstract class Residence extends Component {
    abstract readonly locationUUID: string

    abstract hasCapacity: (type: DudeType) => boolean

    abstract isHomeOf: (uuid: string) => boolean

    abstract setResidentPending: (type: DudeType) => void

    abstract canClaimPendingSlot: (type: DudeType) => boolean

    abstract claimPendingSlot: (type: DudeType, uuid: string) => void

    abstract evictResident: (uuid: string) => void
}
